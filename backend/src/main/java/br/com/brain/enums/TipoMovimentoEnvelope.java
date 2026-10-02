package br.com.brain.enums;

public enum TipoMovimentoEnvelope {
    /** Proposta segura orcamento (+). */
    RESERVA,
    /** Devolve o que a reserva segurava (-). */
    LIBERACAO,
    /** Matricula efetivada assume o ano letivo (+). */
    COMPROMISSO,
    /** Devolve a parte nao realizada (-). */
    ESTORNO,
    /** Correcao manual, com qualquer sinal. */
    AJUSTE
}
