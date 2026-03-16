package br.com.brain.dto.aula;

import java.time.DayOfWeek;

import jakarta.validation.constraints.NotNull;

public record CadastroAulaDto(
        @NotNull Long disciplinaId,
        @NotNull Long turmaId,
        @NotNull Long professorId,
        @NotNull DayOfWeek diaSemana,
        @NotNull Long horarioId) {
}
