package br.com.brain.bolsa;

import br.com.brain.bolsa.dto.ConcessaoBolsaDto;
import br.com.brain.bolsa.dto.ReservarBolsaRequest;
import br.com.brain.bolsa.dto.TetoConcessaoDto;
import br.com.brain.dadosPessoais.DadosPessoais;
import br.com.brain.enums.NaturezaEnvelope;
import br.com.brain.enums.StatusConcessaoBolsa;
import br.com.brain.enums.StatusSimulacaoFinanceira;
import br.com.brain.enums.TipoMovimentoEnvelope;
import br.com.brain.exception.ErrosSistema;
import br.com.brain.simulacao.SimulacaoFinanceira;
import br.com.brain.simulacao.SimulacaoFinanceiraRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.AuditorAware;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * O lado da escrita do orcamento de bolsa: reservar, comprometer, liberar,
 * estornar.
 *
 * Tudo aqui gira em torno de uma invariante: o saldo de um envelope e a soma do
 * razao (movimentos_envelope), e as colunas reservado/comprometido sao apenas
 * cache. Por isso nenhum metodo mexe no cache sem gravar o movimento
 * correspondente na MESMA transacao -- se um dos dois falhar, os dois voltam.
 *
 * O ponto delicado e a concorrencia. Duas secretarias matriculando ao mesmo
 * tempo leem o mesmo saldo, cada uma se acha dentro do teto, e as duas gravam:
 * o orcamento estoura sem que ninguem tenha feito nada errado. A defesa e
 * travar os envelopes com SELECT ... FOR UPDATE ANTES de calcular o teto, e
 * sempre na ordem do id, para que duas transacoes disputando os mesmos
 * envelopes se enfileirem em vez de se bloquearem em circulo.
 *
 * Os tres estados de consumo existem porque proposta e matricula nao sao a
 * mesma coisa: reservado e dinheiro segurado com validade, comprometido e
 * dinheiro gasto, e o que expira volta para o bolo sem intervencao humana.
 */
@Service
@RequiredArgsConstructor
public class BolsaConcessaoService {

    private static final BigDecimal CEM = new BigDecimal("100");
    private static final int ESCALA = 2;
    private static final int DIAS_VALIDADE_PADRAO = 15;

    private final BolsaTetoService tetoService;
    private final PoliticaBolsaRepository politicaRepository;
    private final TipoBolsaRepository tipoBolsaRepository;
    private final AlcadaDescontoRepository alcadaRepository;
    private final EnvelopeBolsaRepository envelopeRepository;
    private final ConcessaoBolsaRepository concessaoRepository;
    private final MovimentoEnvelopeRepository movimentoRepository;
    private final SimulacaoFinanceiraRepository simulacaoRepository;
    private final AuditorAware<Long> auditor;
    private final EntityManager entityManager;

    // ------------------------------------------------------------------ reserva

    /**
     * Concede a bolsa a uma proposta e segura o orcamento correspondente.
     *
     * A ordem importa: travar, calcular, validar, gravar. Calcular antes de
     * travar seria calcular sobre um saldo que outra transacao ja esta mudando.
     */
    @Transactional
    public ConcessaoBolsaDto reservar(ReservarBolsaRequest pedido) {
        var simulacao = simulacaoRepository.findById(pedido.simulacaoId())
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException
                        .para("Simulação financeira", pedido.simulacaoId()));

        if (simulacao.getStatus() != StatusSimulacaoFinanceira.RASCUNHO
                && simulacao.getStatus() != StatusSimulacaoFinanceira.RESERVADA) {
            throw ErrosSistema.OperacaoInvalidaException.com(
                    "A simulação está " + simulacao.getStatus()
                            + " e não aceita nova bolsa. Gere uma nova proposta.");
        }

        var tipoBolsa = tipoBolsaRepository.findById(pedido.tipoBolsaId())
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException
                        .para("Tipo de bolsa", pedido.tipoBolsaId()));

        var jaTemDesteTipo = concessaoRepository
                .findBySimulacaoIdOrderByIdAsc(simulacao.getId()).stream()
                .filter(ConcessaoBolsa::seguraOrcamento)
                .anyMatch(c -> c.getTipoBolsa().getId().equals(pedido.tipoBolsaId()));
        if (jaTemDesteTipo) {
            throw ErrosSistema.OperacaoInvalidaException.com(
                    "Esta proposta já tem uma bolsa '" + tipoBolsa.getNome()
                            + "' vigente. Cancele a anterior antes de conceder outra.");
        }

        var politica = politicaRepository.findByAnoLetivo(simulacao.getAnoLetivo())
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException
                        .para("Política de bolsa do ano letivo", simulacao.getAnoLetivo()));

        var unidadeId = simulacao.getUnidade().getId();
        var serieId = simulacao.getSerie().getId();

        // 1. Trava. A partir daqui ninguem mais mexe nestes envelopes ate o commit.
        var envelopes = travarEnvelopesDoEscopo(
                politica.getId(), unidadeId, serieId, pedido.tipoBolsaId());

        // 2. Calcula ja com as linhas travadas: o BolsaTetoService le os mesmos
        //    envelopes e, no mesmo persistence context, recebe as instancias
        //    travadas -- nao ha leitura suja no meio.
        var teto = tetoService.calcular(
                simulacao.getAnoLetivo(), pedido.tipoBolsaId(), unidadeId, serieId,
                simulacao.getTurno(), simulacao.getQtdParcelas(), LocalDate.now());

        var percentual = pedido.percentual().setScale(ESCALA, RoundingMode.DOWN);

        // 3. Valida. Matriz e alcada nao se excedem nunca; envelope se excede com
        //    aprovacao -- e essa e a diferenca entre regra e orcamento.
        if (percentual.compareTo(teto.tetoMatrizPct()) > 0) {
            throw ErrosSistema.OperacaoInvalidaException.com(
                    "A matriz de descontos permite no máximo " + teto.tetoMatrizPct()
                            + "% para esta série e tipo de bolsa.");
        }
        if (percentual.compareTo(teto.tetoAlcadaPct()) > 0) {
            throw ErrosSistema.OperacaoInvalidaException.com(
                    "Sua alçada vai até " + teto.tetoAlcadaPct()
                            + "%. Acima disso, encaminhe para aprovação da direção.");
        }

        var excedeEnvelope = percentual.compareTo(teto.tetoEnvelopePct()) > 0;
        if (excedeEnvelope) {
            validarExcedente(politica.getId(), teto);
        }

        // 4. Grava. Concessao primeiro: o movimento tem FK para ela.
        var valorRenuncia = valorDe(teto.valorCheioAnual(), percentual);
        var equivalente = percentual.divide(CEM, ESCALA, RoundingMode.HALF_UP);
        var usuario = usuarioAtual();

        var concessao = new ConcessaoBolsa();
        concessao.setTipoBolsa(tipoBolsa);
        concessao.setSimulacao(simulacao);
        concessao.setPercentual(percentual);
        concessao.setValorRenunciaAnual(valorRenuncia);
        concessao.setEquivalenteBolsa(equivalente);
        concessao.setStatus(StatusConcessaoBolsa.RESERVADA);
        concessao.setVigenciaInicio(inicioDoAnoLetivo(simulacao.getAnoLetivo()));
        concessao.setVigenciaFim(fimDoAnoLetivo(simulacao.getAnoLetivo()));
        concessao.setMotivo(pedido.motivo());
        concessao.setSolicitadoPor(usuario);
        concessao.setExcedeuEnvelope(excedeEnvelope);
        if (excedeEnvelope) {
            // O CHECK do banco exige aprovador quando excedeu: quem tem alcada
            // para exceder e, ele proprio, o aprovador do excedente.
            concessao.setAprovadoPor(usuario);
            concessao.setAprovadoEm(Instant.now());
        }
        concessao = concessaoRepository.save(concessao);

        var expiraEm = Instant.now().plus(
                pedido.diasValidade() == null ? DIAS_VALIDADE_PADRAO : pedido.diasValidade(),
                ChronoUnit.DAYS);

        for (var envelope : envelopes) {
            movimentoRepository.save(
                    MovimentoEnvelope.reserva(envelope, concessao, valorRenuncia, equivalente, expiraEm));
            envelope.setReservado(envelope.getReservado().add(valorRenuncia));
            envelope.setReservadoEquiv(envelope.getReservadoEquiv().add(equivalente));
        }

        simulacao.setStatus(StatusSimulacaoFinanceira.RESERVADA);
        simulacao.setReservaExpiraEm(expiraEm);
        sincronizarDesconto(simulacao);

        return new ConcessaoBolsaDto(concessao);
    }

    // ------------------------------------------------------------- compromisso

    /**
     * Matricula efetivada: o que estava segurado passa a estar gasto.
     *
     * Duas linhas no razao, nao um UPDATE: LIBERACAO devolve a reserva e
     * COMPROMISSO assume o ano. O saldo liquido nao muda, mas fica registrado o
     * que aconteceu -- que e a razao de existir um razao.
     */
    @Transactional
    public List<ConcessaoBolsaDto> comprometer(Long simulacaoId, Long contratoId) {
        var simulacao = simulacaoRepository.findById(simulacaoId)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException
                        .para("Simulação financeira", simulacaoId));

        if (simulacao.getStatus() == StatusSimulacaoFinanceira.CONVERTIDA) {
            throw ErrosSistema.OperacaoInvalidaException.com(
                    "Esta simulação já foi convertida no contrato " + simulacao.getContratoId() + ".");
        }

        var concessoes = concessaoRepository
                .findBySimulacaoIdAndStatus(simulacaoId, StatusConcessaoBolsa.RESERVADA);

        for (var concessao : concessoes) {
            for (var envelope : travarEnvelopesDe(concessao, TipoMovimentoEnvelope.RESERVA)) {
                movimentoRepository.save(MovimentoEnvelope.liberacao(
                        envelope, concessao, concessao.getValorRenunciaAnual(), concessao.getEquivalenteBolsa()));
                movimentoRepository.save(MovimentoEnvelope.compromisso(
                        envelope, concessao, concessao.getValorRenunciaAnual(), concessao.getEquivalenteBolsa()));
                envelope.setReservado(naoNegativo(
                        envelope.getReservado().subtract(concessao.getValorRenunciaAnual())));
                envelope.setReservadoEquiv(naoNegativo(
                        envelope.getReservadoEquiv().subtract(concessao.getEquivalenteBolsa())));
                envelope.setComprometido(
                        envelope.getComprometido().add(concessao.getValorRenunciaAnual()));
                envelope.setComprometidoEquiv(
                        envelope.getComprometidoEquiv().add(concessao.getEquivalenteBolsa()));
            }
            concessao.setStatus(StatusConcessaoBolsa.ATIVA);
            concessao.setContratoId(contratoId);
        }

        simulacao.setStatus(StatusSimulacaoFinanceira.CONVERTIDA);
        simulacao.setContratoId(contratoId);
        simulacao.setReservaExpiraEm(null);

        return concessoes.stream().map(ConcessaoBolsaDto::new).toList();
    }

    // ---------------------------------------------------------------- liberacao

    /** Lead perdido, proposta refeita ou reserva vencida: devolve tudo. */
    @Transactional
    public List<ConcessaoBolsaDto> liberar(Long simulacaoId, StatusSimulacaoFinanceira destino, String motivo) {
        var simulacao = simulacaoRepository.findById(simulacaoId)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException
                        .para("Simulação financeira", simulacaoId));

        if (simulacao.getStatus() == StatusSimulacaoFinanceira.CONVERTIDA) {
            throw ErrosSistema.OperacaoInvalidaException.com(
                    "A simulação virou contrato; a bolsa se cancela pelo contrato, não pela proposta.");
        }

        var canceladas = cancelarReservasDe(simulacao, motivo);
        simulacao.setStatus(destino);
        simulacao.setReservaExpiraEm(null);
        sincronizarDesconto(simulacao);

        return canceladas.stream().map(ConcessaoBolsaDto::new).toList();
    }

    /**
     * Devolve ao orcamento o que reservas vencidas ainda seguram.
     *
     * Opera no schema do TenantContext corrente, que e o de quem chamou. Quem
     * roda isso de madrugada para todas as escolas e o
     * BolsaReservaExpiracaoScheduler; continua exposto como operacao porque
     * tambem se chama a mao, e porque um metodo que so o agendador alcanca e um
     * metodo que ninguem consegue testar.
     *
     * @return quantas reservas foram liberadas
     */
    @Transactional
    public int expirarReservasVencidas() {
        var vencidas = simulacaoRepository.buscarReservasVencidas(Instant.now());
        for (var simulacao : vencidas) {
            cancelarReservasDe(simulacao, "Reserva expirada automaticamente.");
            simulacao.setStatus(StatusSimulacaoFinanceira.EXPIRADA);
            simulacao.setReservaExpiraEm(null);
            sincronizarDesconto(simulacao);
        }
        return vencidas.size();
    }

    // ------------------------------------------------------------------ estorno

    /**
     * Aluno saiu no meio do ano. Devolve ao orcamento a parte da renuncia que
     * nao chegou a acontecer, proporcional aos meses que faltavam.
     *
     * Arredonda para BAIXO de proposito: devolver menos do que caberia deixa o
     * orcamento conservador, e um centavo a menos disponivel nunca estourou
     * teto nenhum.
     */
    @Transactional
    public ConcessaoBolsaDto encerrar(Long concessaoId, LocalDate dataEncerramento, String motivo) {
        var concessao = concessaoRepository.findById(concessaoId)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException
                        .para("Concessão de bolsa", concessaoId));

        if (concessao.getStatus() != StatusConcessaoBolsa.ATIVA) {
            throw ErrosSistema.OperacaoInvalidaException.com(
                    "Só uma concessão ATIVA pode ser encerrada; esta está " + concessao.getStatus() + ".");
        }

        var fim = concessao.getVigenciaFim() == null
                ? fimDoAnoLetivo(concessao.getVigenciaInicio().getYear())
                : concessao.getVigenciaFim();

        if (dataEncerramento.isBefore(concessao.getVigenciaInicio()) || dataEncerramento.isAfter(fim)) {
            throw new ErrosSistema.DataInvalidaException(
                    "A data de encerramento está fora da vigência da bolsa.");
        }

        var mesesTotais = mesesEntre(concessao.getVigenciaInicio(), fim);
        var mesesNaoRealizados = mesesEntre(dataEncerramento, fim) - 1;

        var proporcao = mesesNaoRealizados <= 0
                ? BigDecimal.ZERO
                : BigDecimal.valueOf(mesesNaoRealizados)
                        .divide(BigDecimal.valueOf(mesesTotais), 6, RoundingMode.DOWN);

        var valorEstorno = concessao.getValorRenunciaAnual()
                .multiply(proporcao).setScale(ESCALA, RoundingMode.DOWN);
        var equivEstorno = concessao.getEquivalenteBolsa()
                .multiply(proporcao).setScale(ESCALA, RoundingMode.DOWN);

        if (valorEstorno.signum() > 0 || equivEstorno.signum() > 0) {
            for (var envelope : travarEnvelopesDe(concessao, TipoMovimentoEnvelope.COMPROMISSO)) {
                movimentoRepository.save(
                        MovimentoEnvelope.estorno(envelope, concessao, valorEstorno, equivEstorno));
                envelope.setComprometido(naoNegativo(envelope.getComprometido().subtract(valorEstorno)));
                envelope.setComprometidoEquiv(naoNegativo(envelope.getComprometidoEquiv().subtract(equivEstorno)));
            }
        }

        concessao.setStatus(StatusConcessaoBolsa.ENCERRADA);
        concessao.setVigenciaFim(dataEncerramento);
        concessao.setMotivo(motivo);

        return new ConcessaoBolsaDto(concessao);
    }

    // ------------------------------------------------------------------ apoio

    private List<ConcessaoBolsa> cancelarReservasDe(SimulacaoFinanceira simulacao, String motivo) {
        var concessoes = concessaoRepository
                .findBySimulacaoIdAndStatus(simulacao.getId(), StatusConcessaoBolsa.RESERVADA);

        for (var concessao : concessoes) {
            for (var envelope : travarEnvelopesDe(concessao, TipoMovimentoEnvelope.RESERVA)) {
                movimentoRepository.save(MovimentoEnvelope.liberacao(
                        envelope, concessao, concessao.getValorRenunciaAnual(), concessao.getEquivalenteBolsa()));
                envelope.setReservado(naoNegativo(
                        envelope.getReservado().subtract(concessao.getValorRenunciaAnual())));
                envelope.setReservadoEquiv(naoNegativo(
                        envelope.getReservadoEquiv().subtract(concessao.getEquivalenteBolsa())));
            }
            concessao.setStatus(StatusConcessaoBolsa.CANCELADA);
            if (motivo != null) {
                concessao.setMotivo(motivo);
            }
        }
        return concessoes;
    }

    /**
     * Os envelopes que esta concessao tocou, travados de uma vez e na ordem do
     * id.
     *
     * Le do RAZAO, nao do escopo: o escopo pode ter mudado desde a reserva --
     * envelope desativado, politica reconfigurada, serie remanejada -- e o que
     * precisa ser devolvido e o que foi efetivamente tomado, nao o que seria
     * tomado hoje. Recalcular o escopo na devolucao deixaria orcamento preso em
     * envelope que ninguem mais consulta.
     *
     * Uma chamada so em vez de uma por envelope: travar de um em um abre janela
     * entre um lock e o seguinte, que e exatamente onde o deadlock mora.
     */
    private List<EnvelopeBolsa> travarEnvelopesDe(ConcessaoBolsa concessao, TipoMovimentoEnvelope tipo) {
        return travarEmOrdem(movimentoRepository.findByConcessaoIdOrderByIdAsc(concessao.getId()).stream()
                .filter(m -> m.getTipo() == tipo)
                .map(m -> m.getEnvelope().getId())
                .distinct()
                .toList());
    }

    private List<EnvelopeBolsa> travarEnvelopesDoEscopo(
            Long politicaId, Long unidadeId, Long serieId, Long tipoBolsaId) {
        // Sem envelope de teto o orcamento nao restringe -- e cenario valido,
        // nao configuracao faltando. Nao ha o que travar.
        return travarEmOrdem(envelopeRepository.buscarIdsDoEscopo(
                politicaId, NaturezaEnvelope.LIMITE_MAXIMO, unidadeId, serieId, tipoBolsaId));
    }

    /**
     * Trava os envelopes SEMPRE em ordem crescente de id.
     *
     * E a unica coisa que impede deadlock: duas transacoes que disputem os
     * mesmos envelopes na mesma ordem se enfileiram -- uma segura o menor e a
     * outra espera por ele. Em ordens diferentes, cada uma segura o que a outra
     * quer e o banco mata uma das duas.
     *
     * Por isso a ordenacao mora aqui, e nao na chamada: um chamador novo que
     * esquecesse de ordenar so daria erro em producao, sob concorrencia, e
     * intermitente.
     */
    private List<EnvelopeBolsa> travarEmOrdem(List<Long> ids) {
        return ids.stream()
                .sorted()
                .map(id -> envelopeRepository.travar(id)
                        .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException
                                .para("Envelope de bolsa", id)))
                .toList();
    }

    /**
     * Quem pode conceder acima do envelope. Duas condicoes, nao uma: a alcada do
     * usuario precisa autorizar, e o proprio envelope precisa aceitar excedente
     * -- um envelope de piso CEBAS, por exemplo, nao aceita.
     */
    private void validarExcedente(Long politicaId, TetoConcessaoDto teto) {
        var podeExceder = alcadaRepository
                .buscarPorPerfis(politicaId, tetoService.perfisDoUsuario()).stream()
                .anyMatch(a -> Boolean.TRUE.equals(a.getPodeExcederEnvelope()));

        if (!podeExceder) {
            throw ErrosSistema.OperacaoInvalidaException.com(
                    "O orçamento de bolsa comporta " + teto.tetoEnvelopePct()
                            + "% para este aluno. Conceder acima disso exige alçada de direção.");
        }

        var restritivo = teto.envelopeRestritivo();
        if (restritivo != null && Boolean.FALSE.equals(restritivo.permiteExcedente())) {
            throw ErrosSistema.OperacaoInvalidaException.com(
                    "O envelope '" + restritivo.nome() + "' não admite excedente em hipótese alguma.");
        }
    }

    /**
     * Mantem valor_desconto e valor_liquido coerentes com a soma das concessoes
     * vigentes. O banco tem um CHECK exigindo que fechem, entao os dois numeros
     * nao podem andar separados nem por um instante.
     */
    private void sincronizarDesconto(SimulacaoFinanceira simulacao) {
        var total = concessaoRepository.somarRenunciaVigenteDaSimulacao(simulacao.getId());
        var desconto = total == null ? BigDecimal.ZERO : total.setScale(ESCALA, RoundingMode.HALF_UP);

        if (desconto.compareTo(simulacao.getValorBruto()) > 0) {
            throw ErrosSistema.OperacaoInvalidaException.com(
                    "A bolsa concedida (R$ " + desconto + ") passou do valor da proposta (R$ "
                            + simulacao.getValorBruto() + "). Refaça a simulação com os preços atuais.");
        }
        simulacao.aplicarDesconto(desconto);
    }

    /**
     * O teto arredonda para baixo porque e limite; o valor concedido arredonda
     * meio-para-cima porque e dinheiro que a familia vai ver no boleto.
     */
    private BigDecimal valorDe(BigDecimal valorCheio, BigDecimal percentual) {
        return valorCheio.multiply(percentual).divide(CEM, ESCALA, RoundingMode.HALF_UP);
    }

    private DadosPessoais usuarioAtual() {
        var id = auditor.getCurrentAuditor()
                .orElseThrow(() -> new ErrosSistema.AcessoNegadoException(
                        "Não foi possível identificar quem está concedendo a bolsa."));
        // getReference em vez de findById: so precisamos da FK, nao dos dados.
        return entityManager.getReference(DadosPessoais.class, id);
    }

    private static long mesesEntre(LocalDate inicio, LocalDate fim) {
        return ChronoUnit.MONTHS.between(inicio.withDayOfMonth(1), fim.withDayOfMonth(1)) + 1;
    }

    private static LocalDate inicioDoAnoLetivo(Integer anoLetivo) {
        return LocalDate.of(anoLetivo, 1, 1);
    }

    private static LocalDate fimDoAnoLetivo(Integer anoLetivo) {
        return LocalDate.of(anoLetivo, 12, 31);
    }

    private static BigDecimal naoNegativo(BigDecimal valor) {
        return valor.signum() < 0 ? BigDecimal.ZERO : valor;
    }
}
