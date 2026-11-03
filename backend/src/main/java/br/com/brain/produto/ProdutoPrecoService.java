package br.com.brain.produto;

import br.com.brain.dadosPessoais.DadosPessoais;
import br.com.brain.enums.StatusProdutoPreco;
import br.com.brain.exception.ErrosSistema;
import br.com.brain.exception.ErrosSistema.OperacaoInvalidaException;
import br.com.brain.exception.ErrosSistema.RecursoNaoEncontradoException;
import br.com.brain.produto.dto.CadastroProdutoPrecoDto;
import br.com.brain.produto.dto.DecisaoPrecoRequest;
import br.com.brain.produto.dto.ListagemProdutoPrecoDto;
import br.com.brain.serie.SerieRepository;
import br.com.brain.shared.Vigencias;
import br.com.brain.unidade.UnidadeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import org.springframework.data.domain.AuditorAware;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

/**
 * A tabela de precos: o comeco da cadeia.
 *
 * Sem preco nao ha proposta, sem proposta nao ha contrato, e sem contrato nao ha
 * carne. Ate aqui isso so existia por SQL na mao.
 *
 * Duas regras governam o servico, e as duas vem do comentario da V100:
 *
 * 1. NUNCA EDITAR `valor` NO LUGAR. Nao existe metodo para isso, de proposito.
 *    A tabela nao tem gemea _AUD porque ela propria e o historico -- o passado
 *    esta nas vigencias das linhas antigas. Reescrever o valor de uma linha
 *    apagaria o preco que vigorou, e contratos ja assinados deixariam de poder
 *    ser explicados. Reajuste e `cadastrar` com `encerrarAnterior`.
 *
 * 2. DUAS LINHAS NAO PODEM VALER AO MESMO TEMPO PARA O MESMO ESCOPO. Escopos
 *    diferentes podem e devem se sobrepor -- e assim que "geral 1.200, mas 6o
 *    ano 1.350" funciona, com a especificidade desempatando. O que nao pode e
 *    duas linhas identicas em dimensao e vigencia: ali o sistema escolheria uma
 *    por acaso, e a familia receberia um boleto que ninguem sabe explicar.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProdutoPrecoService {

    private final ProdutoPrecoRepository precoRepository;
    private final ProdutoModalidadeRepository modalidadeRepository;
    private final UnidadeRepository unidadeRepository;
    private final SerieRepository serieRepository;
    private final AuditorAware<Long> auditor;
    private final EntityManager entityManager;

    @Transactional(readOnly = true)
    public List<ListagemProdutoPrecoDto> listar(Long modalidadeId) {
        return precoRepository.buscarDaModalidade(modalidadeId).stream()
                .map(ListagemProdutoPrecoDto::new)
                .toList();
    }

    @Transactional
    public ListagemProdutoPrecoDto cadastrar(Long modalidadeId, CadastroProdutoPrecoDto dados) {
        var modalidade = modalidadeRepository.findById(modalidadeId)
                .orElseThrow(() -> RecursoNaoEncontradoException.para("Modalidade de produto", modalidadeId));

        validarVigencia(dados.vigenciaInicio(), dados.vigenciaFim());

        var preco = new ProdutoPreco();
        preco.setModalidade(modalidade);
        preco.setAnoLetivo(dados.anoLetivo());
        preco.setTurno(dados.turno());
        preco.setValor(dados.valor());
        preco.setVigenciaInicio(dados.vigenciaInicio());
        preco.setVigenciaFim(dados.vigenciaFim());

        if (dados.unidadeId() != null) {
            preco.setUnidade(unidadeRepository.findById(dados.unidadeId())
                    .orElseThrow(() -> RecursoNaoEncontradoException.para("Unidade", dados.unidadeId())));
        }
        if (dados.serieId() != null) {
            preco.setSerie(serieRepository.findById(dados.serieId())
                    .orElseThrow(() -> RecursoNaoEncontradoException.para("Série", dados.serieId())));
        }

        // Conferida agora para o erro chegar a quem digitou, e DE NOVO na
        // aprovacao: entre o pedido e a decisao outro preco pode ter entrado, e
        // quem decide precisa ver o conflito do momento, nao o de ontem.
        conferirSobreposicao(modalidadeId, preco, dados.deveEncerrarAnterior());

        // Nasce pendente e NAO encerra o anterior. Encerrar aqui faria o preco
        // antigo morrer na hora do pedido -- e, ate alguem aprovar o novo, o
        // produto ficaria sem preco nenhum e a matricula pararia. Quem encerra o
        // anterior e a aprovacao, no instante em que o novo passa a valer.
        preco.setStatus(StatusProdutoPreco.PENDENTE_APROVACAO);
        preco.setSolicitadoPor(usuarioAtual());

        precoRepository.save(preco);
        log.info("PRECO PEDIDO: modalidade={} valor={} vigencia={} a {} (ano={}, unidade={}, serie={}, turno={})",
                modalidadeId, preco.getValor(), preco.getVigenciaInicio(), preco.getVigenciaFim(),
                preco.getAnoLetivo(), dados.unidadeId(), dados.serieId(), preco.getTurno());

        return new ListagemProdutoPrecoDto(preco);
    }

    /**
     * Encerra um preco numa data. E a unica alteracao permitida numa linha que ja
     * existe, e mesmo assim so para a frente.
     */
    @Transactional
    public ListagemProdutoPrecoDto encerrar(Long precoId, LocalDate dataFim) {
        var preco = buscar(precoId);

        if (dataFim == null) {
            throw OperacaoInvalidaException.com("Informe a data de encerramento.");
        }
        if (dataFim.isBefore(preco.getVigenciaInicio())) {
            throw OperacaoInvalidaException.com(
                    "O encerramento (" + dataFim + ") não pode ser anterior ao início da vigência ("
                            + preco.getVigenciaInicio() + ").");
        }

        preco.setVigenciaFim(dataFim);
        precoRepository.save(preco);
        return new ListagemProdutoPrecoDto(preco);
    }

    /**
     * So apaga preco que ainda nao entrou em vigor -- erro de digitacao antes de
     * valer. Preco que ja vigorou nao se apaga: pode ter precificado um contrato,
     * e sumir com ele deixaria o contrato sem como ser explicado. Para esses, o
     * caminho e encerrar.
     */
    @Transactional
    public void excluir(Long precoId) {
        var preco = buscar(precoId);

        // Pendente nunca precificou nada -- e um pedido, nao um preco. Apagar e
        // o jeito honesto de desistir de um reajuste antes de incomodar quem
        // aprova, mesmo que a vigencia pedida ja tenha comecado.
        if (preco.getStatus() == StatusProdutoPreco.PENDENTE_APROVACAO) {
            precoRepository.delete(preco);
            return;
        }

        if (!preco.getVigenciaInicio().isAfter(LocalDate.now())) {
            throw OperacaoInvalidaException.com(
                    "Este preço já entrou em vigor em " + preco.getVigenciaInicio()
                            + " e pode ter precificado contratos. Encerre a vigência em vez de excluir.");
        }

        precoRepository.delete(preco);
    }

    // -------------------------------------------------------------- aprovacao

    /** A fila de quem aprova preco. */
    @Transactional(readOnly = true)
    public List<ListagemProdutoPrecoDto> pendentesDeAprovacao() {
        return precoRepository.buscarPendentesDeAprovacao().stream()
                .map(ListagemProdutoPrecoDto::new)
                .toList();
    }

    /**
     * Aprova o preco: e aqui que ele passa a valer e o anterior e encerrado.
     *
     * A sobreposicao e reconferida AGORA, contra o estado deste momento. Entre o
     * pedido e a decisao outro preco pode ter sido aprovado para o mesmo escopo,
     * e aprovar os dois deixaria a cobranca indefinida -- o tipo de problema que
     * nao da erro, so faz a familia receber um boleto que ninguem explica.
     */
    @Transactional
    public ListagemProdutoPrecoDto aprovar(Long precoId, DecisaoPrecoRequest decisao) {
        var preco = buscar(precoId);
        var usuario = usuarioAtual();

        exigirPendente(preco, "aprovado");
        garantirQueNaoEOProprioSolicitante(preco, usuario, "aprovar");

        var conflitante = conflitanteDe(preco.getModalidade().getId(), preco);
        if (conflitante != null && conflitante.getStatus() == StatusProdutoPreco.PENDENTE_APROVACAO) {
            throw OperacaoInvalidaException.com(
                    "Há outro pedido de preço pendente para o mesmo escopo (" + conflitante.getValor()
                            + ", a partir de " + conflitante.getVigenciaInicio()
                            + "). Decida um dos dois antes: aprovar os dois deixaria dois preços"
                            + " valendo ao mesmo tempo.");
        }
        if (conflitante != null && !conflitante.getVigenciaInicio().isBefore(preco.getVigenciaInicio())) {
            throw OperacaoInvalidaException.com(
                    "O preço vigente começa em " + conflitante.getVigenciaInicio()
                            + ", que é igual ou posterior ao início deste ("
                            + preco.getVigenciaInicio() + "). Não há como encerrá-lo antes:"
                            + " ajuste a vigência deste pedido.");
        }

        encerrarAnteriorSePreciso(preco);

        preco.setStatus(StatusProdutoPreco.APROVADO);
        preco.setAprovadoPor(usuario);
        preco.setAprovadoEm(Instant.now());
        preco.setMotivoDecisao(decisao == null ? null : decisao.motivo());
        precoRepository.save(preco);

        log.info("PRECO APROVADO: id={} modalidade={} valor={} vigencia a partir de {}",
                preco.getId(), preco.getModalidade().getId(), preco.getValor(),
                preco.getVigenciaInicio());

        return new ListagemProdutoPrecoDto(preco);
    }

    /**
     * Recusa o pedido de preco. A linha fica na tabela em vez de ser apagada:
     * "pediu 1.500, saiu 1.350" e a historia do reajuste.
     */
    @Transactional
    public ListagemProdutoPrecoDto rejeitar(Long precoId, DecisaoPrecoRequest decisao) {
        var preco = buscar(precoId);
        var usuario = usuarioAtual();

        exigirPendente(preco, "rejeitado");
        garantirQueNaoEOProprioSolicitante(preco, usuario, "rejeitar");

        var motivo = decisao == null ? null : decisao.motivo();
        if (motivo == null || motivo.isBlank()) {
            throw OperacaoInvalidaException.com(
                    "Informe o motivo da recusa. É o que explica, em seis meses, por que o preço"
                            + " deste ano é esse.");
        }

        preco.setStatus(StatusProdutoPreco.REJEITADO);
        preco.setAprovadoPor(usuario);
        preco.setAprovadoEm(Instant.now());
        preco.setMotivoDecisao(motivo.trim());
        precoRepository.save(preco);

        return new ListagemProdutoPrecoDto(preco);
    }

    private void exigirPendente(ProdutoPreco preco, String participio) {
        if (preco.getStatus() != StatusProdutoPreco.PENDENTE_APROVACAO) {
            throw OperacaoInvalidaException.com(
                    "Este preço está " + preco.getStatus() + " e não pode mais ser " + participio + "."
                            + (preco.getStatus() == StatusProdutoPreco.APROVADO
                                    ? " Para mudar o valor, cadastre um reajuste: linha de preço"
                                            + " não se edita no lugar."
                                    : ""));
        }
    }

    /**
     * Quem pediu o reajuste nao aprova o proprio pedido.
     *
     * Sem isto, qualquer um com acesso a aprovacao teria poder ilimitado sobre o
     * preco: bastaria pedir e aprovar, e o controle inteiro seria teatro.
     */
    private void garantirQueNaoEOProprioSolicitante(ProdutoPreco preco, DadosPessoais usuario,
            String acao) {
        var solicitante = preco.getSolicitadoPor();
        if (solicitante != null && usuario != null
                && solicitante.getId() != null
                && solicitante.getId().equals(usuario.getId())) {
            throw new ErrosSistema.AcessoNegadoException(
                    "Quem pediu o reajuste não pode " + acao + " o próprio pedido.");
        }
    }

    private DadosPessoais usuarioAtual() {
        var id = auditor.getCurrentAuditor()
                .orElseThrow(() -> new ErrosSistema.AcessoNegadoException(
                        "Não foi possível identificar quem está mexendo na tabela de preços."));
        // getReference em vez de findById: so precisamos da FK, nao dos dados.
        return entityManager.getReference(DadosPessoais.class, id);
    }

    // ------------------------------------------------------------------ regras

    private void validarVigencia(LocalDate inicio, LocalDate fim) {
        if (fim != null && fim.isBefore(inicio)) {
            throw OperacaoInvalidaException.com(
                    "A vigência termina (" + fim + ") antes de começar (" + inicio + ").");
        }
    }

    /**
     * Devolve o preco que ja ocupa este escopo nesta vigencia, ou null.
     *
     * REJEITADO fica de fora: ele nao vale e nao vale mais nunca, entao nao
     * disputa escopo com ninguem. Pendente DISPUTA de proposito -- dois pedidos
     * para o mesmo escopo aprovados em sequencia deixariam dois precos valendo,
     * e a cobranca viraria sorteio.
     */
    private ProdutoPreco conflitanteDe(Long modalidadeId, ProdutoPreco novo) {
        return precoRepository.buscarDaModalidade(modalidadeId).stream()
                .filter(outro -> !outro.getId().equals(novo.getId()))
                .filter(outro -> outro.getStatus() != StatusProdutoPreco.REJEITADO)
                .filter(outro -> mesmoEscopo(outro, novo))
                .filter(outro -> Vigencias.cruzam(
                        outro.getVigenciaInicio(), outro.getVigenciaFim(),
                        novo.getVigenciaInicio(), novo.getVigenciaFim()))
                .findFirst()
                .orElse(null);
    }

    /**
     * Recusa o pedido quando ja ha preco ocupando o escopo, a menos que quem
     * pediu tenha marcado para encerrar o anterior. NAO encerra nada: encerrar e
     * da aprovacao.
     */
    private void conferirSobreposicao(Long modalidadeId, ProdutoPreco novo, boolean encerrarAnterior) {
        var conflitante = conflitanteDe(modalidadeId, novo);

        if (conflitante == null) {
            return;
        }

        if (!encerrarAnterior) {
            throw OperacaoInvalidaException.com(
                    "Já existe preço de " + conflitante.getValor() + " para este mesmo escopo, vigente"
                            + " desde " + conflitante.getVigenciaInicio()
                            + (conflitante.getVigenciaFim() == null
                                    ? " sem fim definido" : " até " + conflitante.getVigenciaFim())
                            + ". Dois preços valendo ao mesmo tempo deixariam a cobrança indefinida:"
                            + " marque para encerrar o anterior, ou ajuste a vigência deste.");
        }

        // Encerrar o anterior so faz sentido se ele COMECOU antes. Se o novo
        // comeca antes do antigo, fechar o antigo no dia anterior ao novo daria
        // uma vigencia que termina antes de comecar -- e o CHECK do banco
        // recusaria, com erro que nao explica nada a quem clicou.
        if (!conflitante.getVigenciaInicio().isBefore(novo.getVigenciaInicio())) {
            throw OperacaoInvalidaException.com(
                    "O preço existente começa em " + conflitante.getVigenciaInicio()
                            + ", que é igual ou posterior ao início deste (" + novo.getVigenciaInicio()
                            + "). Não há como encerrá-lo antes: exclua o preço futuro ou escolha outra data.");
        }

    }

    /**
     * Encerra o preco anterior no dia anterior ao novo. Roda na APROVACAO, nao
     * no pedido: ate alguem decidir, o preco antigo continua sendo o preco.
     */
    private void encerrarAnteriorSePreciso(ProdutoPreco novo) {
        var conflitante = conflitanteDe(novo.getModalidade().getId(), novo);
        if (conflitante == null) {
            return;
        }

        var ultimoDia = novo.getVigenciaInicio().minusDays(1);
        conflitante.setVigenciaFim(ultimoDia);
        precoRepository.save(conflitante);

        log.info("REAJUSTE: preco id={} encerrado em {} para dar lugar ao novo de {}",
                conflitante.getId(), ultimoDia, novo.getValor());
    }

    /**
     * Mesmo escopo = as quatro dimensoes iguais, nulo incluido. Nulo e um valor
     * aqui, nao ausencia: "preco sem serie" e um escopo tao concreto quanto
     * "preco do 6o ano", e dois precos gerais se sobrepondo e exatamente o
     * conflito que esta regra existe para pegar.
     */
    private boolean mesmoEscopo(ProdutoPreco a, ProdutoPreco b) {
        return Objects.equals(a.getAnoLetivo(), b.getAnoLetivo())
                && Objects.equals(unidadeId(a), unidadeId(b))
                && Objects.equals(serieId(a), serieId(b))
                && Objects.equals(a.getTurno(), b.getTurno());
    }

    private Long unidadeId(ProdutoPreco p) {
        return p.getUnidade() == null ? null : p.getUnidade().getId();
    }

    private Long serieId(ProdutoPreco p) {
        return p.getSerie() == null ? null : p.getSerie().getId();
    }

    private ProdutoPreco buscar(Long precoId) {
        return precoRepository.findById(precoId)
                .orElseThrow(() -> RecursoNaoEncontradoException.para("Preço", precoId));
    }
}
