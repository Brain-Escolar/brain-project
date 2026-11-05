package br.com.brain.contrato;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

/**
 * As duas divisoes que o carne exige, e que precisam fechar ao centavo.
 *
 * Dividir 16.650 em 12 da 1.387,50 exato, mas 16.651 da 1.387,583... e e ai que
 * o dinheiro vaza: doze parcelas de 1.387,58 somam 16.650,96, e a familia paga
 * quatro centavos a menos do que contratou. Em cem alunos isso e um buraco que
 * ninguem sabe explicar.
 *
 * A regra aqui e simples e vale para as duas divisoes: arredonda tudo para baixo
 * e joga a sobra na PRIMEIRA posicao. Primeira, e nao ultima, por dois motivos:
 * na divisao em parcelas o pai ve a diferenca no primeiro boleto em vez de levar
 * um susto em dezembro; no rateio entre responsaveis, a primeira posicao e o
 * responsavel principal, que e quem responde pelo contrato.
 */
public final class RateioFinanceiro {

    private static final int ESCALA = 2;
    private static final BigDecimal CEM = new BigDecimal("100");

    private RateioFinanceiro() {
    }

    /**
     * Divide um total em `parcelas` valores que SOMAM exatamente o total.
     *
     * @throws IllegalArgumentException se parcelas <= 0 ou total negativo
     */
    public static List<BigDecimal> dividirEmParcelas(BigDecimal total, int parcelas) {
        if (parcelas <= 0) {
            throw new IllegalArgumentException("A quantidade de parcelas tem de ser positiva.");
        }
        if (total.signum() < 0) {
            throw new IllegalArgumentException("Não se divide valor negativo em parcelas.");
        }
        // Mais de duas casas aqui nao da para acomodar: a coluna e DECIMAL(10,2) e
        // o banco arredondaria na insercao, quebrando a soma justamente na unica
        // coisa que esta funcao existe para garantir. Melhor recusar com mensagem.
        if (total.stripTrailingZeros().scale() > ESCALA) {
            throw new IllegalArgumentException(
                    "Valor a parcelar tem mais de duas casas decimais (" + total.toPlainString()
                            + "). Arredonde antes de parcelar.");
        }

        var base = total.divide(BigDecimal.valueOf(parcelas), ESCALA, RoundingMode.DOWN);
        var sobra = total.setScale(ESCALA, RoundingMode.UNNECESSARY)
                .subtract(base.multiply(BigDecimal.valueOf(parcelas)));

        var valores = new ArrayList<BigDecimal>(parcelas);
        valores.add(base.add(sobra));
        for (var i = 1; i < parcelas; i++) {
            valores.add(base);
        }
        return valores;
    }

    /**
     * Divide um valor entre responsaveis conforme os percentuais, somando
     * exatamente o valor. A posicao 0 e o responsavel principal e recebe a sobra.
     *
     * Os percentuais tem de somar 100. Isso NAO e preciosismo: com 90 a escola
     * cobraria 10% a menos do que contratou, e com 110 cobraria a mais -- os dois
     * sem erro nenhum aparecer, so uma diferenca no caixa no fim do mes.
     */
    public static List<BigDecimal> ratear(BigDecimal valor, List<BigDecimal> percentuais) {
        if (percentuais == null || percentuais.isEmpty()) {
            throw new IllegalArgumentException("Sem responsável não há como ratear.");
        }

        var soma = percentuais.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        if (soma.compareTo(CEM) != 0) {
            throw new IllegalArgumentException(
                    "Os percentuais de rateio somam " + soma.stripTrailingZeros().toPlainString()
                            + "%, e precisam somar exatamente 100%. "
                            + "Corrija o rateio financeiro do aluno antes de efetivar a matrícula.");
        }

        var valores = new ArrayList<BigDecimal>(percentuais.size());
        // Posicao 0 fica por ultimo: precisa saber o que os outros levaram.
        valores.add(BigDecimal.ZERO);

        var distribuido = BigDecimal.ZERO;
        for (var i = 1; i < percentuais.size(); i++) {
            var parte = valor.multiply(percentuais.get(i))
                    .divide(CEM, ESCALA, RoundingMode.DOWN);
            valores.add(parte);
            distribuido = distribuido.add(parte);
        }

        valores.set(0, valor.subtract(distribuido));
        return valores;
    }

    /**
     * Distribui um total entre pesos, proporcionalmente, somando exatamente o
     * total. E como a bolsa do contrato encontra o item em que ela incide.
     *
     * Peso zero recebe zero -- e e por isso que este metodo existe em vez de
     * `ratear`: o seguro escolar nao e elegivel a bolsa e nao pode receber
     * centavo nenhum de desconto, por mais que a divisao proporcional fosse
     * "justa". Elegibilidade e regra, nao arredondamento.
     *
     * A sobra vai para a primeira posicao COM peso, pela mesma razao das outras
     * duas divisoes desta classe: alguem tem de levar o centavo, e tem de ser
     * sempre o mesmo alguem, senao a conta muda conforme a ordem da lista.
     */
    public static List<BigDecimal> distribuirProporcional(BigDecimal total, List<BigDecimal> pesos) {
        if (pesos == null || pesos.isEmpty()) {
            throw new IllegalArgumentException("Sem itens não há como distribuir.");
        }
        if (total.signum() < 0) {
            throw new IllegalArgumentException("Não se distribui valor negativo.");
        }
        if (total.stripTrailingZeros().scale() > ESCALA) {
            throw new IllegalArgumentException(
                    "Valor a distribuir tem mais de duas casas decimais (" + total.toPlainString()
                            + "). Arredonde antes de distribuir.");
        }

        var somaDosPesos = pesos.stream()
                .filter(p -> p != null && p.signum() > 0)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (somaDosPesos.signum() == 0) {
            // Sem nenhum item elegivel, distribuir zero e trivial e distribuir
            // qualquer outra coisa e impossivel. Recusar aqui evita emitir um
            // carne em que o desconto simplesmente evaporou.
            if (total.signum() != 0) {
                throw new IllegalArgumentException(
                        "Não há item elegível para receber " + total.toPlainString()
                                + " de desconto. Confira a elegibilidade dos produtos do contrato.");
            }
            return pesos.stream().map(p -> BigDecimal.ZERO.setScale(ESCALA)).toList();
        }

        var valores = new ArrayList<BigDecimal>(pesos.size());
        var distribuido = BigDecimal.ZERO;
        var primeiroComPeso = -1;

        for (var i = 0; i < pesos.size(); i++) {
            var peso = pesos.get(i);
            if (peso == null || peso.signum() <= 0) {
                valores.add(BigDecimal.ZERO.setScale(ESCALA));
                continue;
            }
            if (primeiroComPeso < 0) {
                primeiroComPeso = i;
            }
            var parte = total.multiply(peso).divide(somaDosPesos, ESCALA, RoundingMode.DOWN);
            valores.add(parte);
            distribuido = distribuido.add(parte);
        }

        var sobra = total.setScale(ESCALA, RoundingMode.UNNECESSARY).subtract(distribuido);
        valores.set(primeiroComPeso, valores.get(primeiroComPeso).add(sobra));
        return valores;
    }
}
