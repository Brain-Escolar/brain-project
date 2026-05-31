package br.com.brain.disponibilidadeProfessor.dto;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.constraints.NotNull;

public record CadastroDisponibilidadeProfessorDto(
        @NotNull List<Long> horariosId,
        LocalDate dataVigencia) {
}
