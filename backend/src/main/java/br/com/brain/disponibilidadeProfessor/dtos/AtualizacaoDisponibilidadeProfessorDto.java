package br.com.brain.disponibilidadeProfessor.dtos;

import java.time.LocalDate;

public record AtualizacaoDisponibilidadeProfessorDto(
        Long horarioId,
        LocalDate dataVigencia) {
}
