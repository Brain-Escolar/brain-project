package br.com.brain.financeiro;

import br.com.brain.enums.FaixaAging;
import br.com.brain.enums.SituacaoParcela;
import br.com.brain.enums.StatusTitulo;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * As duas classificacoes que o financeiro usa para decidir o que dizer a familia.
 *
 * Funcao pura, sem mock e sem Spring -- e justamente onde um erro de "menor" por
 * "menor ou igual" passa desapercebido: a parcela que vence hoje entraria na
 * cobranca, e a escola ligaria para quem esta em dia. Por isso o teste insiste
 * nas BORDAS, nao nos casos do meio.
 */
@DisplayName("classificação do aging e da situação da parcela")
class FaixaAgingTest {

    @Nested
    @DisplayName("FaixaAging")
    class Faixas {

        @Test
        @DisplayName("quem está em dia nunca cai numa faixa de atraso")
        void emDia() {
            assertThat(FaixaAging.de(0)).isEqualTo(FaixaAging.A_VENCER);
            assertThat(FaixaAging.de(-1)).isEqualTo(FaixaAging.A_VENCER);
            assertThat(FaixaAging.de(-45)).isEqualTo(FaixaAging.A_VENCER);
        }

        /**
         * As bordas, uma por uma. Sao estes nove valores que decidem a faixa; o
         * resto do intervalo e consequencia.
         */
        @Test
        @DisplayName("as bordas de cada faixa")
        void bordas() {
            assertThat(FaixaAging.de(1)).isEqualTo(FaixaAging.ATE_30);
            assertThat(FaixaAging.de(30)).isEqualTo(FaixaAging.ATE_30);

            assertThat(FaixaAging.de(31)).isEqualTo(FaixaAging.DE_31_A_60);
            assertThat(FaixaAging.de(60)).isEqualTo(FaixaAging.DE_31_A_60);

            assertThat(FaixaAging.de(61)).isEqualTo(FaixaAging.DE_61_A_90);
            assertThat(FaixaAging.de(90)).isEqualTo(FaixaAging.DE_61_A_90);

            assertThat(FaixaAging.de(91)).isEqualTo(FaixaAging.ACIMA_DE_90);
            assertThat(FaixaAging.de(400)).isEqualTo(FaixaAging.ACIMA_DE_90);
        }

        @Test
        @DisplayName("toda faixa tem rótulo para a tela")
        void rotulos() {
            for (var faixa : FaixaAging.values()) {
                assertThat(faixa.getRotulo())
                        .as("faixa %s sem rótulo", faixa)
                        .isNotBlank();
            }
        }
    }

    @Nested
    @DisplayName("SituacaoParcela")
    class Situacoes {

        /** Relativas a hoje, nunca fixas: fixture com data fixa quebra sozinha. */
        private final LocalDate hoje = LocalDate.now();

        @Test
        @DisplayName("título aberto: o calendário decide")
        void aberto() {
            assertThat(SituacaoParcela.de(StatusTitulo.ABERTO, hoje.plusDays(5), hoje))
                    .isEqualTo(SituacaoParcela.A_VENCER);
            assertThat(SituacaoParcela.de(StatusTitulo.ABERTO, hoje, hoje))
                    .isEqualTo(SituacaoParcela.VENCE_HOJE);
            assertThat(SituacaoParcela.de(StatusTitulo.ABERTO, hoje.minusDays(1), hoje))
                    .isEqualTo(SituacaoParcela.EM_ATRASO);
        }

        @Test
        @DisplayName("status terminal ignora o calendário")
        void terminais() {
            // Um titulo PAGO cujo vencimento ja passou continua PAGO -- obvio
            // dito assim, e e exatamente o bug que apareceria se a data fosse
            // consultada antes do status.
            assertThat(SituacaoParcela.de(StatusTitulo.PAGO, hoje.minusDays(60), hoje))
                    .isEqualTo(SituacaoParcela.PAGA);
            assertThat(SituacaoParcela.de(StatusTitulo.CANCELADO, hoje.minusDays(60), hoje))
                    .isEqualTo(SituacaoParcela.CANCELADA);
            assertThat(SituacaoParcela.de(StatusTitulo.RENEGOCIADO, hoje.minusDays(60), hoje))
                    .isEqualTo(SituacaoParcela.SUBSTITUIDA);
            assertThat(SituacaoParcela.de(StatusTitulo.ESTORNADO, hoje.minusDays(60), hoje))
                    .isEqualTo(SituacaoParcela.ESTORNADA);
        }

        @Test
        @DisplayName("todo status tem situação: nenhum cai fora do switch")
        void nenhumStatusSemSituacao() {
            for (var status : StatusTitulo.values()) {
                assertThat(SituacaoParcela.de(status, hoje, hoje))
                        .as("status %s sem situação", status)
                        .isNotNull();
            }
        }

        @Test
        @DisplayName("só as três situações de título aberto exigem pagamento")
        void exigePagamento() {
            assertThat(SituacaoParcela.A_VENCER.exigePagamento()).isTrue();
            assertThat(SituacaoParcela.VENCE_HOJE.exigePagamento()).isTrue();
            assertThat(SituacaoParcela.EM_ATRASO.exigePagamento()).isTrue();

            assertThat(SituacaoParcela.PAGA.exigePagamento()).isFalse();
            assertThat(SituacaoParcela.CANCELADA.exigePagamento()).isFalse();
            assertThat(SituacaoParcela.SUBSTITUIDA.exigePagamento()).isFalse();
            assertThat(SituacaoParcela.ESTORNADA.exigePagamento()).isFalse();
        }
    }
}
