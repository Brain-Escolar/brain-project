package br.com.brain.enums;

import lombok.Getter;

/**
 * Tipo de escala de avaliação adotada pela escola.
 * NUMERIC cobre notas numéricas (0–10, 0–100, etc.). Deixado como enum para
 * permitir futuras escalas (conceitos/letras) sem quebrar o contrato do boletim.
 */
@Getter
public enum TipoEscala {
    NUMERIC("Numérica");

    private final String descricao;

    TipoEscala(String descricao) {
        this.descricao = descricao;
    }
}
