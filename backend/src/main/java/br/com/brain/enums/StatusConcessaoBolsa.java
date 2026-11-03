package br.com.brain.enums;

public enum StatusConcessaoBolsa {
    /** Calculada na tela, ainda nao segura orcamento. */
    SIMULADA,
    /**
     * Pedida acima da alcada de quem pediu, esperando quem tem alcada maior.
     *
     * NAO segura orcamento. Se segurasse, pedido esquecido prenderia dinheiro
     * ate expirar e a escola nao saberia se o envelope esta cheio ou so mal
     * pedido. O teto e recalculado na aprovacao, contra o envelope daquele
     * momento.
     */
    PENDENTE_APROVACAO,
    /** Proposta feita ao lead: segura orcamento, com validade. */
    RESERVADA,
    /** Matricula efetivada: consome o ano letivo inteiro. */
    ATIVA,
    /** Aluno saiu ou perdeu a bolsa no meio do ano. */
    ENCERRADA,
    /** Lead perdido, reserva vencida ou rescisao. */
    CANCELADA,
    /** Quem tinha alcada olhou e disse nao. Diferente de CANCELADA: houve decisao. */
    REJEITADA
}
