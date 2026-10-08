package br.com.brain.enums;

public enum StatusMatricula {
    /** Vaga reservada, contrato ainda não assinado. */
    PRE_MATRICULA,
    /** Efetivada: existe contrato vigente e títulos abertos. */
    EFETIVADA,
    TRANCADA,
    TRANSFERIDA,
    CANCELADA,
    /** Ano letivo concluído. */
    CONCLUIDA
}
