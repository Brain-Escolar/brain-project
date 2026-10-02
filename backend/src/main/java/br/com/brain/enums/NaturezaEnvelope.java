package br.com.brain.enums;

public enum NaturezaEnvelope {
    /** Teto: alerta quando o consumo se aproxima do limite. */
    LIMITE_MAXIMO,
    /** Piso (CEBAS): alerta quando FALTA atingir a meta. Nunca bloqueia concessao. */
    META_MINIMA
}
