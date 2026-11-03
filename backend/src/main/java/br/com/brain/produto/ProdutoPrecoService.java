package br.com.brain.produto;

import br.com.brain.exception.ErrosSistema.OperacaoInvalidaException;
import br.com.brain.exception.ErrosSistema.RecursoNaoEncontradoException;
import br.com.brain.produto.dto.CadastroProdutoPrecoDto;
import br.com.brain.produto.dto.ListagemProdutoPrecoDto;
import br.com.brain.serie.SerieRepository;
import br.com.brain.shared.Vigencias;
import br.com.brain.unidade.UnidadeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

        resolverSobreposicao(modalidadeId, preco, dados.deveEncerrarAnterior());

        precoRepository.save(preco);
        log.info("PRECO: modalidade={} valor={} vigencia={} a {} (ano={}, unidade={}, serie={}, turno={})",
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

        if (!preco.getVigenciaInicio().isAfter(LocalDate.now())) {
            throw OperacaoInvalidaException.com(
                    "Este preço já entrou em vigor em " + preco.getVigenciaInicio()
                            + " e pode ter precificado contratos. Encerre a vigência em vez de excluir.");
        }

        precoRepository.delete(preco);
    }

    // ------------------------------------------------------------------ regras

    private void validarVigencia(LocalDate inicio, LocalDate fim) {
        if (fim != null && fim.isBefore(inicio)) {
            throw OperacaoInvalidaException.com(
                    "A vigência termina (" + fim + ") antes de começar (" + inicio + ").");
        }
    }

    private void resolverSobreposicao(Long modalidadeId, ProdutoPreco novo, boolean encerrarAnterior) {
        var conflitante = precoRepository.buscarDaModalidade(modalidadeId).stream()
                .filter(outro -> mesmoEscopo(outro, novo))
                .filter(outro -> Vigencias.cruzam(
                        outro.getVigenciaInicio(), outro.getVigenciaFim(),
                        novo.getVigenciaInicio(), novo.getVigenciaFim()))
                .findFirst()
                .orElse(null);

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

        var ultimoDiaDoAnterior = novo.getVigenciaInicio().minusDays(1);
        conflitante.setVigenciaFim(ultimoDiaDoAnterior);
        precoRepository.save(conflitante);

        log.info("REAJUSTE: preco id={} encerrado em {} para dar lugar ao novo de {}",
                conflitante.getId(), ultimoDiaDoAnterior, novo.getValor());
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
