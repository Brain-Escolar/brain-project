package br.com.brain.dto.disponibilidadeProfessor;

import java.time.LocalDate;

public record AtualizacaoDisponibilidadeProfessorDto(
        Long horarioId,
        LocalDate dataVigencia) {
}
