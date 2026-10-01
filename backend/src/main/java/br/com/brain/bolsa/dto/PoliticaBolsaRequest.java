package br.com.brain.bolsa.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * A politica e o guarda-chuva de um ano letivo: matriz, alcadas e envelopes
 * penduram nela. Uma por ano -- o banco cobra isso com UNIQUE em ano_letivo.
 */
public record PoliticaBolsaRequest(

        @NotNull(message = "O ano letivo é obrigatório.")
        @Min(value = 2000, message = "Ano letivo implausível.")
        @Max(value = 2100, message = "Ano letivo implausível.")
        Integer anoLetivo,

        /**
         * Mantenedora filantropica neste ano. Nao e premissa do sistema: quando
         * falso, simplesmente nao se cria envelope de natureza META_MINIMA e
         * nada mais no modelo muda.
         */
        Boolean exigeCebas,

        String observacao) {
}
