package br.com.brain.enums;

public enum StatusAnoLetivo {
    /** Turmas, matrículas e preços podem ser montados; ainda não é o ano corrente. */
    PLANEJAMENTO,
    /** O ano corrente. No máximo um por vez. */
    ABERTO,
    /** Somente leitura. */
    ENCERRADO
}
