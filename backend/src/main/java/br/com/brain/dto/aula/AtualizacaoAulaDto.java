package br.com.brain.dto.aula;

import java.time.DayOfWeek;

public record AtualizacaoAulaDto(
        Long disciplinaId,
        Long turmaId,
        Long professorId,
        Long horarioId,
        DayOfWeek diaSemana) {
}
