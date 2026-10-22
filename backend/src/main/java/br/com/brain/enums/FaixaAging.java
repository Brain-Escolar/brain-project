package br.com.brain.enums;

/**
 * As faixas do aging da inadimplencia.
 *
 * Nao e enfeite de relatorio: a faixa define a acao. Ate 30 dias quase sempre e
 * esquecimento e resolve com lembrete; acima de 90 e evasao ou renegociacao, e a
 * Lei 9.870/99 limita o que a escola pode fazer (nao retem documento, nao
 * suspende prova, desliga so no fim do ano letivo).
 */
public enum FaixaAging {

    /** Ainda nao venceu, ou vence hoje. */
    A_VENCER("A vencer"),
    ATE_30("1 a 30 dias"),
    DE_31_A_60("31 a 60 dias"),
    DE_61_A_90("61 a 90 dias"),
    ACIMA_DE_90("Acima de 90 dias");

    private final String rotulo;

    FaixaAging(String rotulo) {
        this.rotulo = rotulo;
    }

    public String getRotulo() {
        return rotulo;
    }

    /**
     * Classifica pelo atraso em dias.
     *
     * Zero e negativo caem em A_VENCER de proposito: a parcela que vence hoje
     * ainda pode ser paga hoje, e cobrar quem esta em dia e o jeito mais rapido
     * de a escola perder a confianca da familia.
     */
    public static FaixaAging de(long diasDeAtraso) {
        if (diasDeAtraso <= 0) {
            return A_VENCER;
        }
        if (diasDeAtraso <= 30) {
            return ATE_30;
        }
        if (diasDeAtraso <= 60) {
            return DE_31_A_60;
        }
        if (diasDeAtraso <= 90) {
            return DE_61_A_90;
        }
        return ACIMA_DE_90;
    }
}
