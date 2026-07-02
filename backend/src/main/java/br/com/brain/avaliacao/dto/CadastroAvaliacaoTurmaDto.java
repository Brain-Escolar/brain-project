package br.com.brain.avaliacao.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;

public record CadastroAvaliacaoTurmaDto(
        @NotNull Long turmaId,
        Long professorId,
        LocalDate dataAplicacao,
        LocalDate dataEntregaNotas) {
}
