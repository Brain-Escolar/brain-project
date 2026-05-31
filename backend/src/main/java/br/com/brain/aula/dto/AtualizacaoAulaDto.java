package br.com.brain.aula.dto;

import java.time.DayOfWeek;

public record AtualizacaoAulaDto(
        Long disciplinaId,
        Long turmaId,
        Long professorId,
        Long horarioId,
        DayOfWeek diaSemana) {
}
