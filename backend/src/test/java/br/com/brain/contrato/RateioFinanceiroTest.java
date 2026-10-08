package br.com.brain.contrato;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * A aritmetica do carne. Sem mock, sem Spring: e funcao pura, e e aqui que o
 * centavo se perde.
 *
 * O caso que motiva tudo: 16.651 em 12 parcelas da 1.387,583... Doze parcelas de
 * 1.387,58 somam 16.650,96 -- quatro centavos a menos do que a familia
 * contratou. Em cem alunos, e um buraco no caixa que ninguem sabe de onde veio.
 */
@DisplayName("RateioFinanceiro")
class RateioFinanceiroTest {

    @Nested
    @DisplayName("divisão em parcelas")
    class Parcelas {

        /**
         * A invariante que importa: a soma TEM de dar o total. Os casos incluem os
         * que dividem exato (14.400/12) e os que nao dividem (16.651/12, 999,99/7).
         *
         * Em laco e nao em @ParameterizedTest porque nenhum teste do projeto usa
         * junit-jupiter-params ainda, e o `as()` da a mesma clareza na falha.
         */
        @Test
        @DisplayName("a soma das parcelas sempre fecha com o total")
        void somaSempreFecha() {
            String[][] casos = {
                    {"16650.00", "12"}, {"16651.00", "12"}, {"14400.00", "12"},
                    {"11520.00", "12"}, {"16650.01", "12"}, {"1000.00", "6"},
                    {"1000.00", "10"}, {"0.01", "12"}, {"16650.00", "1"},
                    {"0.00", "12"}, {"999.99", "7"},
            };

            for (var caso : casos) {
                var valor = new BigDecimal(caso[0]);
                var parcelas = Integer.parseInt(caso[1]);
                var divisao = RateioFinanceiro.dividirEmParcelas(valor, parcelas);

                assertThat(divisao)
                        .as("%s em %dx devia gerar %d parcelas", caso[0], parcelas, parcelas)
                        .hasSize(parcelas);
                assertThat(divisao.stream().reduce(BigDecimal.ZERO, BigDecimal::add))
                        .as("%s em %dx: a soma das parcelas %s", caso[0], parcelas, divisao)
                        .isEqualByComparingTo(valor);
            }
        }

        @Test
        @DisplayName("valor com mais de duas casas é recusado")
        void casasDemais() {
            assertThatThrownBy(() -> RateioFinanceiro.dividirEmParcelas(
                    new BigDecimal("1387.583"), 12))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("duas casas decimais");
        }

        /**
         * A sobra vai na PRIMEIRA, nao na ultima: o pai ve a diferenca no primeiro
         * boleto em vez de levar um susto em dezembro.
         */
        @Test
        @DisplayName("a sobra fica na primeira parcela")
        void sobraNaPrimeira() {
            var divisao = RateioFinanceiro.dividirEmParcelas(new BigDecimal("16651.00"), 12);

            assertThat(divisao.getFirst()).isEqualByComparingTo("1387.62");
            assertThat(divisao.subList(1, 12))
                    .allSatisfy(v -> assertThat(v).isEqualByComparingTo("1387.58"));
        }

        @Test
        @DisplayName("divisão exata não cria sobra")
        void divisaoExata() {
            var divisao = RateioFinanceiro.dividirEmParcelas(new BigDecimal("14400.00"), 12);

            assertThat(divisao).allSatisfy(v -> assertThat(v).isEqualByComparingTo("1200.00"));
        }

        @Test
        @DisplayName("parcela única leva o total")
        void parcelaUnica() {
            // Direto no elemento, e nao via singleElement(): aquele devolve
            // ObjectAssert<BigDecimal>, o assert genérico, que não tem
            // isEqualByComparingTo. assertThat(BigDecimal) resolve no assert certo.
            var divisao = RateioFinanceiro.dividirEmParcelas(new BigDecimal("450.00"), 1);

            assertThat(divisao).hasSize(1);
            assertThat(divisao.getFirst()).isEqualByComparingTo("450.00");
        }

        @Test
        @DisplayName("zero parcelas é recusado")
        void zeroParcelas() {
            assertThatThrownBy(() -> RateioFinanceiro.dividirEmParcelas(BigDecimal.TEN, 0))
                    .isInstanceOf(IllegalArgumentException.class);
        }

        @Test
        @DisplayName("valor negativo é recusado")
        void valorNegativo() {
            assertThatThrownBy(() -> RateioFinanceiro.dividirEmParcelas(new BigDecimal("-1.00"), 12))
                    .isInstanceOf(IllegalArgumentException.class);
        }
    }

    @Nested
    @DisplayName("rateio entre responsáveis")
    class Rateio {

        @Test
        @DisplayName("60/40 fecha e a sobra fica com o principal")
        void sessentaQuarenta() {
            var valor = new BigDecimal("1387.58");
            var partes = RateioFinanceiro.ratear(valor,
                    List.of(new BigDecimal("60.00"), new BigDecimal("40.00")));

            // 40% de 1387,58 = 555,032 -> 555,03 para baixo.
            // O principal leva o resto: 1387,58 - 555,03 = 832,55.
            assertThat(partes).containsExactly(
                    new BigDecimal("832.55"), new BigDecimal("555.03"));
            assertThat(partes.stream().reduce(BigDecimal.ZERO, BigDecimal::add))
                    .isEqualByComparingTo(valor);
        }

        @Test
        @DisplayName("três responsáveis em 33,33/33,33/33,34 fecham")
        void tresResponsaveis() {
            var valor = new BigDecimal("1387.58");
            var partes = RateioFinanceiro.ratear(valor, List.of(
                    new BigDecimal("33.33"), new BigDecimal("33.33"), new BigDecimal("33.34")));

            assertThat(partes.stream().reduce(BigDecimal.ZERO, BigDecimal::add))
                    .isEqualByComparingTo(valor);
        }

        @Test
        @DisplayName("responsável único leva tudo")
        void responsavelUnico() {
            var partes = RateioFinanceiro.ratear(new BigDecimal("1387.58"),
                    List.of(new BigDecimal("100.00")));

            assertThat(partes).hasSize(1);
            assertThat(partes.getFirst()).isEqualByComparingTo("1387.58");
        }

        /**
         * Percentual que nao soma 100 e erro de configuracao que o banco nao pega:
         * com 90 a escola cobraria 10% a menos do que contratou, sem erro nenhum
         * aparecer -- so uma diferenca no caixa no fim do mes.
         */
        @Test
        @DisplayName("percentuais que não somam 100 são recusados, com o valor na mensagem")
        void percentualIncompleto() {
            assertThatThrownBy(() -> RateioFinanceiro.ratear(BigDecimal.TEN,
                    List.of(new BigDecimal("60.00"), new BigDecimal("30.00"))))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("90")
                    .hasMessageContaining("100%");
        }

        @Test
        @DisplayName("percentuais acima de 100 também são recusados")
        void percentualExcedente() {
            assertThatThrownBy(() -> RateioFinanceiro.ratear(BigDecimal.TEN,
                    List.of(new BigDecimal("60.00"), new BigDecimal("60.00"))))
                    .isInstanceOf(IllegalArgumentException.class);
        }

        @Test
        @DisplayName("lista vazia é recusada")
        void semResponsavel() {
            assertThatThrownBy(() -> RateioFinanceiro.ratear(BigDecimal.TEN, List.of()))
                    .isInstanceOf(IllegalArgumentException.class);
        }
    }

    /**
     * O caso real: parcelar E ratear, bruto e desconto separados. E a composicao
     * que o servico faz, e onde um erro de arredondamento se multiplicaria por 12
     * parcelas e 2 responsaveis antes de alguem notar.
     */
    @Test
    @DisplayName("parcelar e ratear juntos: o líquido total fecha e o desconto nunca passa do bruto")
    void composicaoFecha() {
        var bruto = new BigDecimal("16650.00");
        var desconto = new BigDecimal("3330.00");
        var percentuais = List.of(new BigDecimal("60.00"), new BigDecimal("40.00"));

        var brutoPorParcela = RateioFinanceiro.dividirEmParcelas(bruto, 12);
        var descontoPorParcela = RateioFinanceiro.dividirEmParcelas(desconto, 12);

        var liquidoTotal = BigDecimal.ZERO;

        for (var i = 0; i < 12; i++) {
            var brutoRateado = RateioFinanceiro.ratear(brutoPorParcela.get(i), percentuais);
            var descontoRateado = RateioFinanceiro.ratear(descontoPorParcela.get(i), percentuais);

            for (var j = 0; j < 2; j++) {
                // CHECK do banco: valor_desconto <= valor_bruto em cada título.
                assertThat(descontoRateado.get(j))
                        .as("parcela %d, responsável %d", i + 1, j)
                        .isLessThanOrEqualTo(brutoRateado.get(j));

                liquidoTotal = liquidoTotal.add(
                        brutoRateado.get(j).subtract(descontoRateado.get(j)));
            }
        }

        assertThat(liquidoTotal).isEqualByComparingTo(bruto.subtract(desconto));
    }
}
