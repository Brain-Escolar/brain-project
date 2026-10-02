package br.com.brain.enums;

public enum StatusConcessaoBolsa {
    /** Calculada na tela, ainda nao segura orcamento. */
    SIMULADA,
    /** Proposta feita ao lead: segura orcamento, com validade. */
    RESERVADA,
    /** Matricula efetivada: consome o ano letivo inteiro. */
    ATIVA,
    /** Aluno saiu ou perdeu a bolsa no meio do ano. */
    ENCERRADA,
    /** Lead perdido, reserva vencida ou rescisao. */
    CANCELADA
}
