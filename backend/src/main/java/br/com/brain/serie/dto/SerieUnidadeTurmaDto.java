package br.com.brain.serie.dto;

import jakarta.validation.constraints.NotNull;

public record SerieUnidadeTurmaDto(
        @NotNull Long serieId,
        @NotNull Long unidadeId,
        @NotNull Long turmaId) {
}
