package br.com.brain.contrato;

import br.com.brain.aluno.Aluno;
import br.com.brain.bolsa.BolsaConcessaoService;
import br.com.brain.contrato.dto.ContratoDto;
import br.com.brain.contrato.dto.EfetivarMatriculaRequest;
import br.com.brain.enums.StatusContratoServico;
import br.com.brain.enums.StatusMatricula;
import br.com.brain.enums.StatusSimulacaoFinanceira;
import br.com.brain.exception.ErrosSistema;
import br.com.brain.matricula.AlunoResponsavelFinanceiro;
import br.com.brain.matricula.AlunoResponsavelFinanceiroRepository;
import br.com.brain.matricula.Matricula;
import br.com.brain.matricula.MatriculaRepository;
import br.com.brain.simulacao.SimulacaoFinanceira;
import br.com.brain.simulacao.SimulacaoFinanceiraRepository;
import br.com.brain.turma.Turma;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * A efetivacao da matricula: onde a proposta deixa de ser simulacao e passa a ser
 * cobranca.
 *
 * O principio que governa tudo aqui e um: NAO RECALCULAR. Os valores vem da
 * simulacao como estao. Se recalculassemos a partir da tabela de precos, uma
 * efetivacao feita em novembro aplicaria o preco de novembro a uma proposta
 * fechada em setembro -- e a familia receberia um boleto diferente do que
 * assinou. Por isso o contrato e os itens guardam snapshot, e esta classe nao
 * consulta produtos_precos em lugar nenhum.
 *
 * Tudo numa transacao, inclusive o comprometimento do orcamento de bolsa: se os
 * titulos falharem, o envelope nao e consumido. Meia efetivacao e pior que
 * nenhuma.
 */
@Service
@RequiredArgsConstructor
public class MatriculaEfetivacaoService {

    /**
     * Mes letivo em que a cobranca comeca, por padrao. O ano letivo brasileiro
     * abre em fevereiro; quem precisar de outro mes passa no pedido.
     */
    private static final int MES_PADRAO_PRIMEIRA_COMPETENCIA = 2;

    private final SimulacaoFinanceiraRepository simulacaoRepository;
    private final MatriculaRepository matriculaRepository;
    private final ContratoServicoRepository contratoRepository;
    private final TituloRepository tituloRepository;
    private final AlunoResponsavelFinanceiroRepository rateioRepository;
    private final BolsaConcessaoService bolsaConcessaoService;
    private final EntityManager entityManager;

    @Transactional
    public ContratoDto efetivar(EfetivarMatriculaRequest pedido) {
        var simulacao = simulacaoRepository.findById(pedido.simulacaoId())
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException
                        .para("Simulação financeira", pedido.simulacaoId()));

        if (simulacao.getStatus() == StatusSimulacaoFinanceira.CONVERTIDA) {
            throw ErrosSistema.OperacaoInvalidaException.com(
                    "Esta proposta já foi convertida no contrato " + simulacao.getContratoId()
                            + ". Para refazer, rescinda o contrato existente.");
        }
        if (simulacao.getStatus() == StatusSimulacaoFinanceira.EXPIRADA
                || simulacao.getStatus() == StatusSimulacaoFinanceira.PERDIDA) {
            throw ErrosSistema.OperacaoInvalidaException.com(
                    "A proposta está " + simulacao.getStatus()
                            + " e não pode ser efetivada. Gere uma nova com os preços atuais.");
        }

        var aluno = resolverAluno(simulacao);
        var dataEfetivacao = pedido.dataEfetivacao() == null ? LocalDate.now() : pedido.dataEfetivacao();

        var matricula = obterOuCriarMatricula(simulacao, aluno, pedido, dataEfetivacao);
        var rateio = resolverRateio(aluno, simulacao, dataEfetivacao);

        var contrato = montarContrato(simulacao, matricula, rateio.getFirst(), pedido, dataEfetivacao);
        contrato = contratoRepository.save(contrato);

        emitirTitulos(contrato, simulacao, rateio, pedido);

        matricula.setStatus(StatusMatricula.EFETIVADA);
        matricula.setDataEfetivacao(dataEfetivacao);

        // Na MESMA transacao: o reservado vira comprometido e a concessao vira
        // ATIVA. Se algo acima falhou, nada disso aconteceu.
        bolsaConcessaoService.comprometer(simulacao.getId(), contrato.getId());

        return new ContratoDto(contrato, tituloRepository
                .findByContratoIdOrderByNumeroParcelaAscIdAsc(contrato.getId()));
    }

    // ------------------------------------------------------------------ aluno

    /**
     * Lead do funil nao tem aluno proprio ate ser cadastrado; rematricula tem.
     * `matriculas.aluno_id` e NOT NULL, entao sem aluno nao ha matricula.
     */
    private Aluno resolverAluno(SimulacaoFinanceira simulacao) {
        if (simulacao.getAluno() != null) {
            return simulacao.getAluno();
        }
        if (simulacao.getProcessoMatricula() != null
                && simulacao.getProcessoMatricula().getAluno() != null) {
            return simulacao.getProcessoMatricula().getAluno();
        }
        throw ErrosSistema.OperacaoInvalidaException.com(
                "A proposta não está ligada a um aluno cadastrado. Complete o cadastro do aluno "
                        + "antes de efetivar a matrícula.");
    }

    // -------------------------------------------------------------- matricula

    /**
     * Reaproveita a matricula do ano se ela existir e nao estiver efetivada --
     * pre-matricula virando matricula e o caminho normal. Matricula ja efetivada
     * COM contrato vigente e recusada: duas cobrancas para o mesmo ano letivo e o
     * tipo de erro que so aparece quando a familia liga reclamando.
     */
    private Matricula obterOuCriarMatricula(SimulacaoFinanceira simulacao, Aluno aluno,
            EfetivarMatriculaRequest pedido, LocalDate dataEfetivacao) {

        var existentes = matriculaRepository
                .findByAlunoIdAndAnoLetivoOrderByIdDesc(aluno.getId(), simulacao.getAnoLetivo());

        for (var m : existentes) {
            if (m.estaEfetivada()
                    && contratoRepository.existsByMatriculaIdAndStatus(
                            m.getId(), StatusContratoServico.VIGENTE)) {
                throw ErrosSistema.OperacaoInvalidaException.com(
                        "Este aluno já tem matrícula efetivada com contrato vigente em "
                                + simulacao.getAnoLetivo() + ".");
            }
        }

        var aproveitavel = existentes.stream()
                .filter(m -> m.getStatus() == StatusMatricula.PRE_MATRICULA
                        || m.getStatus() == StatusMatricula.EFETIVADA)
                .findFirst();

        var matricula = aproveitavel.orElseGet(Matricula::new);
        matricula.setAluno(aluno);
        matricula.setAnoLetivo(simulacao.getAnoLetivo());
        matricula.setUnidade(simulacao.getUnidade());
        matricula.setSerie(simulacao.getSerie());
        matricula.setTurno(simulacao.getTurno());
        matricula.setProcessoMatricula(simulacao.getProcessoMatricula());
        if (pedido.turmaId() != null) {
            matricula.setTurma(entityManager.getReference(Turma.class, pedido.turmaId()));
        }
        if (matricula.getStatus() == null) {
            matricula.setStatus(StatusMatricula.PRE_MATRICULA);
        }

        return matriculaRepository.save(matricula);
    }

    // ----------------------------------------------------------------- rateio

    /**
     * Quem paga, e em que proporcao. A posicao 0 e sempre o principal -- e dele
     * que o contrato fica no nome, e e ele que absorve o centavo da divisao.
     *
     * Aluno sem rateio cadastrado e o caso comum de lead novo: a migration que
     * criou a tabela so preencheu quem ja existia. Em vez de recusar, cria o
     * vinculo com o responsavel da propria proposta a 100% -- que e exatamente o
     * que a escola quis dizer ao montar a proposta no nome dele.
     */
    private List<AlunoResponsavelFinanceiro> resolverRateio(
            Aluno aluno, SimulacaoFinanceira simulacao, LocalDate data) {

        var vigentes = rateioRepository.buscarVigentes(aluno.getId(), data).stream()
                .filter(AlunoResponsavelFinanceiro::participaDaConta)
                .toList();

        if (!vigentes.isEmpty()) {
            return vigentes;
        }

        if (simulacao.getResponsavel() == null) {
            throw ErrosSistema.OperacaoInvalidaException.com(
                    "Não há responsável financeiro definido para este aluno, e a proposta também "
                            + "não indica um. Defina quem paga antes de efetivar a matrícula.");
        }

        var novo = new AlunoResponsavelFinanceiro();
        novo.setAluno(aluno);
        novo.setResponsavel(simulacao.getResponsavel());
        novo.setPrincipal(true);
        novo.setPercentualRateio(new BigDecimal("100.00"));
        novo.setVigenciaInicio(data);

        return List.of(rateioRepository.save(novo));
    }

    // --------------------------------------------------------------- contrato

    private ContratoServico montarContrato(SimulacaoFinanceira simulacao, Matricula matricula,
            AlunoResponsavelFinanceiro titular, EfetivarMatriculaRequest pedido,
            LocalDate dataEfetivacao) {

        var primeira = primeiraCompetencia(pedido, simulacao, dataEfetivacao);
        var ultima = primeira.plusMonths(simulacao.getQtdParcelas() - 1L);

        var contrato = new ContratoServico();
        contrato.setMatricula(matricula);
        contrato.setResponsavel(titular.getResponsavel());
        contrato.setNumero(numeroDoContrato(matricula, simulacao.getAnoLetivo()));
        contrato.setQtdParcelas(simulacao.getQtdParcelas());
        contrato.setDiaVencimento(simulacao.getDiaVencimento());
        // Copiados da simulacao, nao recalculados. Ver o javadoc da classe.
        contrato.definirValores(simulacao.getValorBruto(), simulacao.getValorDesconto());
        contrato.setStatus(StatusContratoServico.VIGENTE);
        contrato.setDataInicio(primeira);
        contrato.setDataFim(ultima.plusMonths(1).minusDays(1));

        for (var item : simulacao.getItens()) {
            var copia = new ContratoItem();
            copia.setModalidade(item.getModalidade());
            copia.setPreco(item.getPreco());
            copia.setDescricao(item.getDescricao());
            copia.setValorUnitario(item.getValorUnitario());
            copia.setQuantidade(item.getQuantidade());
            copia.setElegivelBolsa(item.getElegivelBolsa());
            contrato.adicionarItem(copia);
        }

        return contrato;
    }

    /**
     * `numero` e unico no banco. Rescindir e refazer gera um segundo contrato para
     * a MESMA matricula, entao o id da matricula sozinho nao basta -- sem o sufixo,
     * o segundo contrato estoura a constraint em producao, no pior momento.
     */
    private String numeroDoContrato(Matricula matricula, Integer anoLetivo) {
        var anteriores = contratoRepository.countByMatriculaId(matricula.getId());
        var base = "CT-" + anoLetivo + "-" + matricula.getId();
        return anteriores == 0 ? base : base + "-" + (anteriores + 1);
    }

    /**
     * Fevereiro do ano letivo, ou o mes da efetivacao se for depois.
     *
     * Quem matricula em junho nao deve fevereiro: gerar parcelas vencidas no
     * passado encheria a tela do responsavel de inadimplencia inventada. A
     * QUANTIDADE de parcelas, porem, vem da proposta e nao e ajustada aqui -- se a
     * matricula de meio de ano deveria ter menos parcelas, isso e decisao da
     * proposta, e e la que tem de ser corrigido. Esta classe nao recalcula.
     */
    private LocalDate primeiraCompetencia(EfetivarMatriculaRequest pedido,
            SimulacaoFinanceira simulacao, LocalDate dataEfetivacao) {

        if (pedido.primeiraCompetencia() != null) {
            return pedido.primeiraCompetencia().withDayOfMonth(1);
        }
        var aberturaDoAnoLetivo = LocalDate.of(
                simulacao.getAnoLetivo(), MES_PADRAO_PRIMEIRA_COMPETENCIA, 1);
        var mesDaEfetivacao = dataEfetivacao.withDayOfMonth(1);

        return mesDaEfetivacao.isAfter(aberturaDoAnoLetivo) ? mesDaEfetivacao : aberturaDoAnoLetivo;
    }

    // ---------------------------------------------------------------- titulos

    /**
     * Um titulo por parcela e por responsavel.
     *
     * Bruto e desconto sao parcelados SEPARADAMENTE, e nao o liquido, porque o
     * titulo guarda os dois: e isso que deixa o responsavel ver "mensalidade
     * 1.387,58 / bolsa -277,50 / a pagar 1.110,08" em vez de so o liquido. Bolsa
     * que nao aparece no boleto e bolsa que a familia nao percebe que recebeu.
     */
    private void emitirTitulos(ContratoServico contrato, SimulacaoFinanceira simulacao,
            List<AlunoResponsavelFinanceiro> rateio, EfetivarMatriculaRequest pedido) {

        var parcelas = contrato.getQtdParcelas();
        var brutoPorParcela = RateioFinanceiro.dividirEmParcelas(contrato.getValorBruto(), parcelas);
        var descontoPorParcela = RateioFinanceiro.dividirEmParcelas(contrato.getValorDesconto(), parcelas);

        var percentuais = rateio.stream()
                .map(AlunoResponsavelFinanceiro::getPercentualRateio)
                .toList();

        var titulos = new ArrayList<Titulo>(parcelas * rateio.size());

        for (var i = 0; i < parcelas; i++) {
            var competencia = contrato.getDataInicio().plusMonths(i);
            var vencimento = competencia.withDayOfMonth(contrato.getDiaVencimento());
            var descricao = "Parcela " + (i + 1) + "/" + parcelas + " — "
                    + simulacao.getAnoLetivo();

            var brutoRateado = RateioFinanceiro.ratear(brutoPorParcela.get(i), percentuais);
            var descontoRateado = RateioFinanceiro.ratear(descontoPorParcela.get(i), percentuais);

            for (var j = 0; j < rateio.size(); j++) {
                titulos.add(Titulo.parcela(
                        contrato,
                        rateio.get(j).getResponsavel(),
                        competencia,
                        i + 1,
                        vencimento,
                        descricao,
                        brutoRateado.get(j),
                        descontoRateado.get(j)));
            }
        }

        tituloRepository.saveAll(titulos);
    }

    // ------------------------------------------------------------------ leitura

    @Transactional(readOnly = true)
    public ContratoDto buscarContrato(Long contratoId) {
        var contrato = contratoRepository.buscarComItens(contratoId)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException
                        .para("Contrato de serviço", contratoId));
        return new ContratoDto(contrato,
                tituloRepository.findByContratoIdOrderByNumeroParcelaAscIdAsc(contratoId));
    }

    @Transactional(readOnly = true)
    public List<ContratoDto> contratosDaMatricula(Long matriculaId) {
        return contratoRepository.findByMatriculaIdOrderByIdDesc(matriculaId).stream()
                .map(c -> new ContratoDto(c, tituloRepository
                        .findByContratoIdOrderByNumeroParcelaAscIdAsc(c.getId())))
                .toList();
    }
}
