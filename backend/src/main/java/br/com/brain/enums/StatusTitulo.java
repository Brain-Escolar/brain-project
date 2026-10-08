package br.com.brain.enums;

public enum StatusTitulo {
    ABERTO,
    PAGO,
    CANCELADO,
    /** Baixa revertida. O título original fica; o estorno é outro registro. */
    ESTORNADO,
    /** Substituído por outro título, que aponta para este em titulo_origem_id. */
    RENEGOCIADO
}
