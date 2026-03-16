package br.com.brain.dto.disciplina;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CadastroDisciplinaDto(
        @NotNull Long serieId,
        @NotBlank String nome,
        @NotBlank int cargaHoraria,
        @NotNull Long grupoId) {
}
