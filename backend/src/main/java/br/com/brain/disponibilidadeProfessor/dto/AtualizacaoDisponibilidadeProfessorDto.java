package br.com.brain.disponibilidadeProfessor.dto;

import java.time.LocalDate;

public record AtualizacaoDisponibilidadeProfessorDto(
        Long horarioId,
        LocalDate dataVigencia) {
}
