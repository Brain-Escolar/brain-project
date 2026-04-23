package br.com.brain.aula.dtos;

import java.time.DayOfWeek;

import jakarta.validation.constraints.NotNull;

public record CadastroAulaDto(
        @NotNull Long disciplinaId,
        @NotNull Long turmaId,
        Long professorId,
        @NotNull DayOfWeek diaSemana,
        @NotNull Long horarioId) {
}
