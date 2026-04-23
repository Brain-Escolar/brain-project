package br.com.brain.disciplina.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record CadastroDisciplinaDto(
        @NotNull Long serieId,
        @NotBlank String nome,
        @PositiveOrZero int cargaHoraria,
        @NotNull Long grupoId) {
}
