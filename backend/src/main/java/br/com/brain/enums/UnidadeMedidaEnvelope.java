package br.com.brain.enums;

public enum UnidadeMedidaEnvelope {
    /** Limite em reais, fixo. */
    VALOR_ABSOLUTO,
    /** Limite como percentual da receita. O denominador se move: recalcular sempre. */
    PERCENTUAL_RECEITA,
    /** Limite em numero de bolsas equivalentes (2 meias-bolsas = 1 integral). */
    QUANTIDADE_EQUIVALENTE,
    /** So mede o consumo, nao restringe. */
    SEM_LIMITE
}
