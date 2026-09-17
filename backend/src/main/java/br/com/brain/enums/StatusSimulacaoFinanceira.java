package br.com.brain.enums;

public enum StatusSimulacaoFinanceira {
    RASCUNHO,
    /** Proposta entregue ao lead; segura orcamento ate reserva_expira_em. */
    RESERVADA,
    /** Virou contrato. */
    CONVERTIDA,
    /** Passou da validade sem virar matricula. */
    EXPIRADA,
    /** Lead perdido. */
    PERDIDA
}
