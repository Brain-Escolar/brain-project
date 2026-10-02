package br.com.brain.documentoEscolar.dto;

import java.math.BigDecimal;

/** Nota final e carga horária de um componente em um ano. Nulos quando não cursado. */
public record NotaAnoHistoricoDto(
        Integer anoLetivo,
        BigDecimal nota,
        Integer cargaHoraria) {
}
