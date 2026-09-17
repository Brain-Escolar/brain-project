package br.com.brain.bolsa;

import br.com.brain.enums.TipoMovimentoEnvelope;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Teste minusculo e de proposito: o sinal do movimento e a unica coisa que
 * separa "devolveu orcamento" de "gastou mais orcamento".
 *
 * O banco tem um CHECK cobrando a coerencia, mas o CHECK so reclama no INSERT,
 * dentro de uma transacao, num teste que sobe o Spring inteiro. Aqui o erro
 * aparece em milissegundos -- e um sinal invertido e o tipo de coisa que passa
 * despercebida numa revisao.
 */
@DisplayName("MovimentoEnvelope (sinais)")
class MovimentoEnvelopeTest {

    private static final BigDecimal VALOR = new BigDecimal("2880.00");
    private static final BigDecimal EQUIV = new BigDecimal("0.20");

    @Test
    @DisplayName("reserva e compromisso consomem: sinal positivo")
    void entradasSaoPositivas() {
        var reserva = MovimentoEnvelope.reserva(null, null, VALOR, EQUIV, Instant.now());
        assertThat(reserva.getTipo()).isEqualTo(TipoMovimentoEnvelope.RESERVA);
        assertThat(reserva.getValor()).isEqualByComparingTo("2880.00");
        assertThat(reserva.getEquivalenteBolsa()).isEqualByComparingTo("0.20");

        var compromisso = MovimentoEnvelope.compromisso(null, null, VALOR, EQUIV);
        assertThat(compromisso.getValor()).isEqualByComparingTo("2880.00");
    }

    @Test
    @DisplayName("liberação e estorno devolvem: sinal negativo")
    void devolucoesSaoNegativas() {
        var liberacao = MovimentoEnvelope.liberacao(null, null, VALOR, EQUIV);
        assertThat(liberacao.getValor()).isEqualByComparingTo("-2880.00");
        assertThat(liberacao.getEquivalenteBolsa()).isEqualByComparingTo("-0.20");

        var estorno = MovimentoEnvelope.estorno(null, null, VALOR, EQUIV);
        assertThat(estorno.getValor()).isEqualByComparingTo("-2880.00");
    }

    /**
     * Quem chama passa o valor da concessao, que e sempre positivo. Se um dia
     * chegar ja negativo, a devolucao nao pode virar consumo por distracao.
     */
    @Test
    @DisplayName("o sinal vem do tipo, não de quem chamou")
    void sinalNaoDependeDoChamador() {
        var negativo = VALOR.negate();

        assertThat(MovimentoEnvelope.reserva(null, null, negativo, EQUIV, null).getValor())
                .isEqualByComparingTo("2880.00");
        assertThat(MovimentoEnvelope.liberacao(null, null, negativo, EQUIV).getValor())
                .isEqualByComparingTo("-2880.00");
    }

    @Test
    @DisplayName("só reserva carrega validade")
    void somenteReservaExpira() {
        assertThat(MovimentoEnvelope.reserva(null, null, VALOR, EQUIV, Instant.now()).getExpiraEm())
                .isNotNull();
        assertThat(MovimentoEnvelope.compromisso(null, null, VALOR, EQUIV).getExpiraEm())
                .isNull();
        assertThat(MovimentoEnvelope.estorno(null, null, VALOR, EQUIV).getExpiraEm())
                .isNull();
    }

    /** Ajuste e o unico que aceita qualquer sinal: e correcao manual. */
    @Test
    @DisplayName("ajuste preserva o sinal que recebeu")
    void ajustePreservaSinal() {
        assertThat(MovimentoEnvelope.ajuste(null, null, VALOR.negate(), EQUIV).getValor())
                .isEqualByComparingTo("-2880.00");
        assertThat(MovimentoEnvelope.ajuste(null, null, VALOR, EQUIV).getValor())
                .isEqualByComparingTo("2880.00");
    }
}
