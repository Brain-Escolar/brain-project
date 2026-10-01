package br.com.brain.bolsa;

import br.com.brain.bolsa.dto.AlcadaDescontoDto;
import br.com.brain.bolsa.dto.AlcadaDescontoRequest;
import br.com.brain.bolsa.dto.ConciliacaoEnvelopeDto;
import br.com.brain.bolsa.dto.EnvelopeBolsaRequest;
import br.com.brain.bolsa.dto.EnvelopeConfiguracaoDto;
import br.com.brain.bolsa.dto.MatrizDescontoDto;
import br.com.brain.bolsa.dto.MatrizDescontoRequest;
import br.com.brain.bolsa.dto.PoliticaBolsaDto;
import br.com.brain.bolsa.dto.PoliticaBolsaRequest;
import br.com.brain.bolsa.dto.TipoBolsaDto;
import br.com.brain.bolsa.dto.TipoBolsaRequest;
import br.com.brain.enums.BaseCalculoEnvelope;
import br.com.brain.enums.NaturezaEnvelope;
import br.com.brain.enums.UnidadeMedidaEnvelope;
import br.com.brain.exception.ErrosSistema;
import br.com.brain.perfil.PerfilRepository;
import br.com.brain.produto.Produto;
import br.com.brain.serie.Serie;
import br.com.brain.unidade.Unidade;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

/**
 * Configuracao do orcamento de bolsa: politica, tipos, matriz, alcadas e
 * envelopes.
 *
 * Sem isto o motor de bolsa existe e ninguem consegue liga-lo -- o calculo do
 * teto comeca procurando a politica do ano letivo e falha sem ela.
 *
 * Tres coisas aqui nao sao CRUD, e sao as que importam:
 *
 *   1. Sobreposicao de matriz. O banco nao consegue expressar "duas regras de
 *      mesma especificidade com vigencias que se cruzam", e duas regras assim
 *      fazem o teto virar sorteio.
 *
 *   2. Integridade temporal. Matriz em vigor nao se edita no lugar: o teto e
 *      calculado na DATA DA PROPOSTA, entao mudar o percentual de uma regra que
 *      ja valia reescreve propostas ja feitas. Encerra e substitui.
 *
 *   3. Unidade de medida de envelope com consumo. reservado/comprometido estao
 *      gravados numa unidade; trocar a unidade faz os mesmos numeros passarem a
 *      significar outra coisa, sem erro nenhum.
 *
 * O que o BANCO ja garante e aqui so ganha mensagem legivel: um ano letivo por
 * politica (UNIQUE em ano_letivo), um codigo por tipo de bolsa, uma alcada por
 * perfil por politica (uq_alcadas_desconto_politica_perfil) e a coerencia entre
 * unidade de medida e campo de limite (os CHECK de envelopes_bolsa). Violacao de
 * constraint chega ao usuario como erro 500 -- a validacao aqui existe para ele
 * ler o que fez de errado, nao para repetir o trabalho do banco.
 */
@Service
@RequiredArgsConstructor
public class BolsaConfiguracaoService {

    private final PoliticaBolsaRepository politicaRepository;
    private final TipoBolsaRepository tipoBolsaRepository;
    private final MatrizDescontoRepository matrizRepository;
    private final AlcadaDescontoRepository alcadaRepository;
    private final EnvelopeBolsaRepository envelopeRepository;
    private final MovimentoEnvelopeRepository movimentoRepository;
    private final PerfilRepository perfilRepository;
    private final EntityManager entityManager;

    // ----------------------------------------------------------------- politica

    @Transactional
    public PoliticaBolsaDto criarPolitica(PoliticaBolsaRequest pedido) {
        if (politicaRepository.existsByAnoLetivo(pedido.anoLetivo())) {
            throw ErrosSistema.RecursoJaExisteException
                    .para("Política de bolsa do ano letivo " + pedido.anoLetivo());
        }

        var politica = new PoliticaBolsa();
        politica.setAnoLetivo(pedido.anoLetivo());
        politica.setExigeCebas(Boolean.TRUE.equals(pedido.exigeCebas()));
        politica.setObservacao(pedido.observacao());

        return dtoDe(politicaRepository.save(politica));
    }

    /**
     * O ano letivo NAO e alteravel: ele e a identidade da politica, e tudo que
     * pendura nela (matriz, alcada, envelope, concessao) foi decidido para aquele
     * ano. Mudar o ano moveria a renuncia de um ano para outro sem deixar rastro.
     */
    @Transactional
    public PoliticaBolsaDto atualizarPolitica(Long id, PoliticaBolsaRequest pedido) {
        var politica = buscarPolitica(id);

        if (!Objects.equals(politica.getAnoLetivo(), pedido.anoLetivo())) {
            throw ErrosSistema.OperacaoInvalidaException.com(
                    "O ano letivo de uma política não muda — ele é a identidade dela. "
                            + "Crie a política do ano " + pedido.anoLetivo() + " separadamente.");
        }

        politica.setExigeCebas(Boolean.TRUE.equals(pedido.exigeCebas()));
        politica.setObservacao(pedido.observacao());

        return dtoDe(politica);
    }

    @Transactional(readOnly = true)
    public List<PoliticaBolsaDto> listarPoliticas() {
        return politicaRepository.findAllByOrderByAnoLetivoDesc().stream()
                .map(this::dtoDe)
                .toList();
    }

    @Transactional(readOnly = true)
    public PoliticaBolsaDto buscarPoliticaDoAno(Integer anoLetivo) {
        return dtoDe(politicaRepository.findByAnoLetivo(anoLetivo)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException
                        .para("Política de bolsa do ano letivo", anoLetivo)));
    }

    // -------------------------------------------------------------------- tipos

    @Transactional
    public TipoBolsaDto criarTipo(TipoBolsaRequest pedido) {
        var codigo = pedido.codigo().trim().toUpperCase();
        if (tipoBolsaRepository.existsByCodigo(codigo)) {
            throw ErrosSistema.RecursoJaExisteException.para("Tipo de bolsa com código " + codigo);
        }

        var tipo = new TipoBolsa();
        tipo.setCodigo(codigo);
        aplicar(tipo, pedido);

        return new TipoBolsaDto(tipoBolsaRepository.save(tipo));
    }

    /**
     * O codigo tambem nao muda: e por ele que integracao, relatorio e importacao
     * de planilha se referem ao tipo. Trocar SOCIAL por SOC quebraria tudo que
     * aponta para ca sem o banco reclamar.
     */
    @Transactional
    public TipoBolsaDto atualizarTipo(Long id, TipoBolsaRequest pedido) {
        var tipo = tipoBolsaRepository.findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Tipo de bolsa", id));

        var codigo = pedido.codigo().trim().toUpperCase();
        if (!codigo.equals(tipo.getCodigo())) {
            throw ErrosSistema.OperacaoInvalidaException.com(
                    "O código de um tipo de bolsa não muda — é por ele que o resto do sistema "
                            + "se refere ao tipo. Desative este e crie outro.");
        }

        aplicar(tipo, pedido);
        return new TipoBolsaDto(tipo);
    }

    @Transactional(readOnly = true)
    public List<TipoBolsaDto> listarTipos() {
        return tipoBolsaRepository.listarTodosComProdutos().stream()
                .map(TipoBolsaDto::new)
                .toList();
    }

    private void aplicar(TipoBolsa tipo, TipoBolsaRequest pedido) {
        tipo.setNome(pedido.nome().trim());
        tipo.setEstrutural(pedido.estrutural());
        tipo.setExigeComprovacao(Boolean.TRUE.equals(pedido.exigeComprovacao()));
        tipo.setContaParaCebas(Boolean.TRUE.equals(pedido.contaParaCebas()));
        tipo.setAcumulaComOutras(pedido.acumulaComOutras() == null || pedido.acumulaComOutras());
        tipo.setAtivo(pedido.ativo() == null || pedido.ativo());

        if (pedido.produtoIds() != null) {
            tipo.getProdutos().clear();
            pedido.produtoIds().stream().distinct()
                    .map(produtoId -> entityManager.getReference(Produto.class, produtoId))
                    .forEach(tipo.getProdutos()::add);
        }
    }

    // ------------------------------------------------------------------- matriz

    @Transactional
    public MatrizDescontoDto criarMatriz(MatrizDescontoRequest pedido) {
        validarVigencia(pedido.vigenciaInicio(), pedido.vigenciaFim());
        garantirSemSobreposicao(pedido, null);

        var matriz = new MatrizDesconto();
        matriz.setPolitica(buscarPolitica(pedido.politicaId()));
        matriz.setTipoBolsa(buscarTipo(pedido.tipoBolsaId()));
        aplicarEscopo(matriz, pedido);
        matriz.setPercentualMax(pedido.percentualMax());
        matriz.setVigenciaInicio(pedido.vigenciaInicio());
        matriz.setVigenciaFim(pedido.vigenciaFim());

        return new MatrizDescontoDto(matrizRepository.save(matriz));
    }

    /**
     * Edicao em LUGAR, permitida so enquanto a regra nao entrou em vigor.
     *
     * Uma regra que ja valia foi usada para calcular propostas, e o teto e
     * recalculavel pela data da proposta -- se o percentual mudasse aqui, aquela
     * proposta passaria a ser avaliada por uma regra que nao existia quando foi
     * feita. Para mudar uma regra em vigor existe `substituirMatriz`.
     */
    @Transactional
    public MatrizDescontoDto atualizarMatriz(Long id, MatrizDescontoRequest pedido) {
        var matriz = buscarMatriz(id);

        if (jaEntrouEmVigor(matriz)) {
            throw ErrosSistema.OperacaoInvalidaException.com(
                    "Esta regra já está em vigor desde " + matriz.getVigenciaInicio()
                            + " e propostas podem ter sido calculadas com ela. Em vez de editar, "
                            + "encerre-a e crie a nova regra (substituir), para que uma proposta "
                            + "antiga continue sendo avaliada pela regra que valia quando foi feita.");
        }

        validarVigencia(pedido.vigenciaInicio(), pedido.vigenciaFim());
        garantirSemSobreposicao(pedido, id);

        matriz.setTipoBolsa(buscarTipo(pedido.tipoBolsaId()));
        aplicarEscopo(matriz, pedido);
        matriz.setPercentualMax(pedido.percentualMax());
        matriz.setVigenciaInicio(pedido.vigenciaInicio());
        matriz.setVigenciaFim(pedido.vigenciaFim());

        return new MatrizDescontoDto(matriz);
    }

    /**
     * Encerra a regra atual e abre a nova, numa transacao.
     *
     * E assim que uma matriz muda sem apagar o passado: a antiga ganha
     * vigencia_fim no dia anterior ao inicio da nova, e as duas convivem na
     * tabela. Proposta de marco continua sendo avaliada pela regra de marco.
     */
    @Transactional
    public MatrizDescontoDto substituirMatriz(Long id, MatrizDescontoRequest pedido) {
        var atual = buscarMatriz(id);
        validarVigencia(pedido.vigenciaInicio(), pedido.vigenciaFim());

        if (!pedido.vigenciaInicio().isAfter(atual.getVigenciaInicio())) {
            throw ErrosSistema.OperacaoInvalidaException.com(
                    "A nova regra precisa começar depois de " + atual.getVigenciaInicio()
                            + ", que é o início da regra que está sendo substituída.");
        }

        // Encerra no dia anterior: vigencias nao podem compartilhar nem um dia,
        // senao as duas casam na mesma data e o teto volta a ser sorteio.
        atual.setVigenciaFim(pedido.vigenciaInicio().minusDays(1));

        garantirSemSobreposicao(pedido, id);

        var nova = new MatrizDesconto();
        nova.setPolitica(buscarPolitica(pedido.politicaId()));
        nova.setTipoBolsa(buscarTipo(pedido.tipoBolsaId()));
        aplicarEscopo(nova, pedido);
        nova.setPercentualMax(pedido.percentualMax());
        nova.setVigenciaInicio(pedido.vigenciaInicio());
        nova.setVigenciaFim(pedido.vigenciaFim());

        return new MatrizDescontoDto(matrizRepository.save(nova));
    }

    @Transactional(readOnly = true)
    public List<MatrizDescontoDto> listarMatrizes(Long politicaId) {
        return matrizRepository.listarDaPolitica(politicaId).stream()
                .map(MatrizDescontoDto::new)
                .toList();
    }

    /**
     * Duas regras conflitam quando teriam o MESMO peso de especificidade e
     * vigencias que se cruzam.
     *
     * Escopos diferentes convivem de proposito: a regra geral e a da serie se
     * sobrepoem no tempo e a da serie vence por ser mais especifica -- e para isso
     * que a especificidade existe. O que nao pode e duas regras indistinguiveis,
     * porque ai `tetoMatriz` desempata por vigencia_inicio e o resultado passa a
     * depender da ordem em que foram cadastradas.
     *
     * Em Java e nao em SQL: comparar escopo nulo e cruzamento de vigencia em JPQL
     * exige `:param IS NULL`, que o PostgreSQL recusa sem CAST, e o H2 trata
     * diferente. Sao poucas linhas por politica e tipo.
     */
    private void garantirSemSobreposicao(MatrizDescontoRequest pedido, Long idIgnorado) {
        var conflitante = matrizRepository
                .findByPoliticaIdAndTipoBolsaIdOrderByIdAsc(pedido.politicaId(), pedido.tipoBolsaId())
                .stream()
                .filter(outra -> !outra.getId().equals(idIgnorado))
                .filter(outra -> mesmoEscopo(outra, pedido))
                .filter(outra -> vigenciasCruzam(
                        outra.getVigenciaInicio(), outra.getVigenciaFim(),
                        pedido.vigenciaInicio(), pedido.vigenciaFim()))
                .findFirst();

        if (conflitante.isPresent()) {
            var outra = conflitante.get();
            throw ErrosSistema.OperacaoInvalidaException.com(
                    "Já existe uma regra de " + outra.getPercentualMax() + "% para este mesmo escopo,"
                            + " vigente de " + outra.getVigenciaInicio()
                            + (outra.getVigenciaFim() == null ? " sem fim definido" : " a " + outra.getVigenciaFim())
                            + ". Duas regras iguais valendo ao mesmo tempo deixariam o teto indefinido:"
                            + " encerre a anterior (substituir) ou ajuste a vigência desta.");
        }
    }

    private boolean mesmoEscopo(MatrizDesconto outra, MatrizDescontoRequest pedido) {
        var unidadeDaOutra = outra.getUnidade() == null ? null : outra.getUnidade().getId();
        var serieDaOutra = outra.getSerie() == null ? null : outra.getSerie().getId();
        return Objects.equals(unidadeDaOutra, pedido.unidadeId())
                && Objects.equals(serieDaOutra, pedido.serieId());
    }

    /**
     * Fim nulo significa "sem fim", ou seja, infinito -- e nao "termina hoje".
     * Tratar nulo como data faria duas regras abertas parecerem nao se cruzar.
     */
    static boolean vigenciasCruzam(
            LocalDate aInicio, LocalDate aFim, LocalDate bInicio, LocalDate bFim) {
        var aComecaAntesDeBTerminar = bFim == null || !aInicio.isAfter(bFim);
        var bComecaAntesDeATerminar = aFim == null || !bInicio.isAfter(aFim);
        return aComecaAntesDeBTerminar && bComecaAntesDeATerminar;
    }

    private boolean jaEntrouEmVigor(MatrizDesconto matriz) {
        return !matriz.getVigenciaInicio().isAfter(LocalDate.now());
    }

    private void validarVigencia(LocalDate inicio, LocalDate fim) {
        if (fim != null && fim.isBefore(inicio)) {
            throw new ErrosSistema.DataInvalidaException(
                    "O fim da vigência (" + fim + ") não pode ser antes do início (" + inicio + ").");
        }
    }

    private void aplicarEscopo(MatrizDesconto matriz, MatrizDescontoRequest pedido) {
        matriz.setUnidade(referencia(Unidade.class, pedido.unidadeId()));
        matriz.setSerie(referencia(Serie.class, pedido.serieId()));
    }

    // ------------------------------------------------------------------ alcadas

    /**
     * Upsert, nao create.
     *
     * O banco tem UNIQUE (politica_id, perfil_id) e quem configura nao pensa em
     * "criar ou editar" -- pensa "a direcao vai ate 100%". Cadastrar duas vezes o
     * mesmo perfil deveria ajustar, nao estourar constraint.
     */
    @Transactional
    public AlcadaDescontoDto definirAlcada(AlcadaDescontoRequest pedido) {
        var politica = buscarPolitica(pedido.politicaId());

        var perfil = perfilRepository.findByNome(pedido.perfil());
        if (perfil == null) {
            throw ErrosSistema.RecursoNaoEncontradoException.para("Perfil", pedido.perfil());
        }

        var alcada = alcadaRepository.buscarDoPerfil(politica.getId(), pedido.perfil())
                .orElseGet(() -> {
                    var nova = new AlcadaDesconto();
                    nova.setPolitica(politica);
                    nova.setPerfil(perfil);
                    return nova;
                });

        alcada.setPercentualMax(pedido.percentualMax());
        alcada.setPodeExcederEnvelope(Boolean.TRUE.equals(pedido.podeExcederEnvelope()));

        return new AlcadaDescontoDto(alcadaRepository.save(alcada));
    }

    /**
     * Alcada pode ser excluida de verdade: nada aponta para ela por FK, e ela nao
     * descreve o passado -- so diz quem pode conceder de agora em diante. Quem
     * concedeu o que fica em concessoes_bolsa.solicitado_por.
     */
    @Transactional
    public void excluirAlcada(Long id) {
        var alcada = alcadaRepository.findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Alçada", id));
        alcadaRepository.delete(alcada);
    }

    @Transactional(readOnly = true)
    public List<AlcadaDescontoDto> listarAlcadas(Long politicaId) {
        return alcadaRepository.listarDaPolitica(politicaId).stream()
                .map(AlcadaDescontoDto::new)
                .toList();
    }

    // ---------------------------------------------------------------- envelopes

    @Transactional
    public EnvelopeConfiguracaoDto criarEnvelope(EnvelopeBolsaRequest pedido) {
        validarCoerenciaDaMedida(pedido);

        var envelope = new EnvelopeBolsa();
        envelope.setPolitica(buscarPolitica(pedido.politicaId()));
        envelope.setNatureza(pedido.natureza());
        envelope.setUnidadeMedida(pedido.unidadeMedida());
        aplicar(envelope, pedido);

        return new EnvelopeConfiguracaoDto(envelopeRepository.save(envelope));
    }

    /**
     * Limite muda livremente -- e para isso que um orcamento existe, e escola
     * levanta teto no meio da campanha. O que NAO muda depois do primeiro consumo
     * e a unidade de medida e a natureza.
     *
     * reservado/comprometido estao gravados numa unidade. Trocar VALOR_ABSOLUTO
     * por QUANTIDADE_EQUIVALENTE faria "2880" deixar de ser reais e passar a ser
     * numero de bolsas, sem erro nenhum e sem conversao. A natureza e pior ainda:
     * inverte o sentido da comparacao, e um teto viraria piso.
     */
    @Transactional
    public EnvelopeConfiguracaoDto atualizarEnvelope(Long id, EnvelopeBolsaRequest pedido) {
        var envelope = buscarEnvelope(id);
        validarCoerenciaDaMedida(pedido);

        var temConsumo = movimentoRepository.countByEnvelopeId(id) > 0;

        if (temConsumo && envelope.getUnidadeMedida() != pedido.unidadeMedida()) {
            throw ErrosSistema.OperacaoInvalidaException.com(
                    "Este envelope já tem consumo registrado em " + envelope.getUnidadeMedida()
                            + ". Trocar a unidade de medida faria os valores já gastos significarem"
                            + " outra coisa. Desative este envelope e crie outro na medida nova.");
        }

        if (temConsumo && envelope.getNatureza() != pedido.natureza()) {
            throw ErrosSistema.OperacaoInvalidaException.com(
                    "Este envelope já tem consumo registrado e mudar a natureza inverteria o sentido"
                            + " da regra — um teto passaria a ser piso. Desative-o e crie outro.");
        }

        envelope.setNatureza(pedido.natureza());
        envelope.setUnidadeMedida(pedido.unidadeMedida());
        aplicar(envelope, pedido);

        return new EnvelopeConfiguracaoDto(envelope);
    }

    /**
     * Desativar e o caminho normal de "tirar do ar": o envelope para de restringir
     * concessao nova e continua explicando a renuncia que ja passou por ele.
     */
    @Transactional
    public EnvelopeConfiguracaoDto alternarEnvelope(Long id, boolean ativo) {
        var envelope = buscarEnvelope(id);
        envelope.setAtivo(ativo);
        return new EnvelopeConfiguracaoDto(envelope);
    }

    /**
     * Excluir de verdade, so se nunca foi usado.
     *
     * Com movimento no razao, a FK de movimentos_envelope impediria o DELETE de
     * qualquer forma -- e mesmo que nao impedisse, apagar levaria embora a
     * explicacao de uma renuncia ja concedida.
     */
    @Transactional
    public void excluirEnvelope(Long id) {
        var envelope = buscarEnvelope(id);

        if (movimentoRepository.countByEnvelopeId(id) > 0) {
            throw ErrosSistema.OperacaoInvalidaException.com(
                    "Este envelope já foi usado para conceder bolsa e não pode ser excluído —"
                            + " apagá-lo levaria embora a explicação de uma renúncia já concedida."
                            + " Desative-o: ele para de restringir concessão nova e o histórico fica.");
        }
        envelopeRepository.delete(envelope);
    }

    @Transactional(readOnly = true)
    public List<EnvelopeConfiguracaoDto> listarEnvelopes(Long politicaId) {
        return envelopeRepository.listarDaPolitica(politicaId).stream()
                .map(EnvelopeConfiguracaoDto::new)
                .toList();
    }

    /**
     * Cache do envelope contra a soma do razao.
     *
     * reservado/comprometido sao cache; a verdade e movimentos_envelope. Cache que
     * divergiu nao da erro -- so entrega relatorio de renuncia errado no fim do
     * ano. Isto e o que permite perguntar "o saldo esta certo?" sem auditoria
     * manual, e vale rodar depois de qualquer correcao em producao.
     */
    @Transactional(readOnly = true)
    public List<ConciliacaoEnvelopeDto> conciliar(Long politicaId) {
        return envelopeRepository.listarDaPolitica(politicaId).stream()
                .map(e -> ConciliacaoEnvelopeDto.de(
                        e.getId(),
                        e.getNome(),
                        e.getReservado(),
                        zeroSeNulo(movimentoRepository.somarReservadoNoRazao(e.getId())),
                        e.getComprometido(),
                        zeroSeNulo(movimentoRepository.somarComprometidoNoRazao(e.getId()))))
                .toList();
    }

    private void aplicar(EnvelopeBolsa envelope, EnvelopeBolsaRequest pedido) {
        envelope.setNome(pedido.nome().trim());
        envelope.setValorLimite(pedido.valorLimite());
        envelope.setPercentualLimite(pedido.percentualLimite());
        envelope.setQuantidadeLimite(pedido.quantidadeLimite());
        envelope.setBaseCalculo(pedido.baseCalculo());
        envelope.setReceitaProjetada(pedido.receitaProjetada());
        envelope.setUnidade(referencia(Unidade.class, pedido.unidadeId()));
        envelope.setSerie(referencia(Serie.class, pedido.serieId()));
        envelope.setTipoBolsa(pedido.tipoBolsaId() == null ? null : buscarTipo(pedido.tipoBolsaId()));
        envelope.setPermiteExcedente(pedido.permiteExcedente() == null || pedido.permiteExcedente());
    }

    /**
     * O banco tem um CHECK por combinacao, e ele continua sendo a rede de
     * seguranca. Isto existe para a mensagem ser legivel: violacao de CHECK chega
     * ao usuario como erro 500 com nome de constraint dentro.
     */
    private void validarCoerenciaDaMedida(EnvelopeBolsaRequest pedido) {
        switch (pedido.unidadeMedida()) {
            case VALOR_ABSOLUTO -> exigir(pedido.valorLimite() != null,
                    "Envelope em valor absoluto precisa do limite em R$.");

            case PERCENTUAL_RECEITA -> {
                exigir(pedido.percentualLimite() != null,
                        "Envelope percentual precisa do percentual da receita.");
                exigir(pedido.baseCalculo() != null,
                        "Envelope percentual precisa da base de cálculo: receita realizada ou projetada. "
                                + "A realizada cresce a cada matrícula a preço cheio; a projetada existe "
                                + "porque no início da campanha a realizada é quase zero e ninguém "
                                + "conseguiria conceder bolsa nenhuma.");
                if (pedido.baseCalculo() == BaseCalculoEnvelope.RECEITA_PROJETADA) {
                    exigir(pedido.receitaProjetada() != null,
                            "Base projetada precisa do valor da receita projetada.");
                }
            }

            case QUANTIDADE_EQUIVALENTE -> exigir(pedido.quantidadeLimite() != null,
                    "Envelope em quantidade precisa do limite em bolsas equivalentes "
                            + "(1,00 = uma bolsa integral; 0,50 = meia).");

            case SEM_LIMITE -> exigir(
                    pedido.valorLimite() == null
                            && pedido.percentualLimite() == null
                            && pedido.quantidadeLimite() == null,
                    "Envelope sem limite não aceita nenhum valor de limite. "
                            + "\"Sem teto adicional\" é um cenário válido, não configuração incompleta.");
        }

        if (pedido.natureza() == NaturezaEnvelope.META_MINIMA
                && pedido.unidadeMedida() == UnidadeMedidaEnvelope.SEM_LIMITE) {
            throw ErrosSistema.OperacaoInvalidaException.com(
                    "Um piso mínimo sem limite não quer dizer nada: ou há uma meta a cumprir, "
                            + "ou não há meta e o envelope não precisa existir.");
        }
    }

    private void exigir(boolean condicao, String mensagem) {
        if (!condicao) {
            throw ErrosSistema.OperacaoInvalidaException.com(mensagem);
        }
    }

    // -------------------------------------------------------------------- apoio

    private PoliticaBolsaDto dtoDe(PoliticaBolsa politica) {
        return new PoliticaBolsaDto(
                politica,
                matrizRepository.countByPoliticaId(politica.getId()),
                alcadaRepository.countByPoliticaId(politica.getId()),
                envelopeRepository.countByPoliticaId(politica.getId()));
    }

    private PoliticaBolsa buscarPolitica(Long id) {
        return politicaRepository.findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Política de bolsa", id));
    }

    private TipoBolsa buscarTipo(Long id) {
        return tipoBolsaRepository.findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Tipo de bolsa", id));
    }

    private MatrizDesconto buscarMatriz(Long id) {
        return matrizRepository.findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException
                        .para("Regra da matriz de descontos", id));
    }

    private EnvelopeBolsa buscarEnvelope(Long id) {
        return envelopeRepository.findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Envelope de bolsa", id));
    }

    private <T> T referencia(Class<T> tipo, Long id) {
        return id == null ? null : entityManager.getReference(tipo, id);
    }

    private static BigDecimal zeroSeNulo(BigDecimal valor) {
        return valor == null ? BigDecimal.ZERO : valor;
    }
}
