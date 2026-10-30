package br.com.brain.enums;

public enum StatusContratoServico {
    /** Montado e ainda sem efeito financeiro. */
    RASCUNHO,
    /** Vigente: é o que entra na receita realizada do envelope de bolsa. */
    VIGENTE,
    /** Rompido no meio do ano letivo. */
    RESCINDIDO,
    /** Chegou ao fim da vigência. */
    ENCERRADO
}
