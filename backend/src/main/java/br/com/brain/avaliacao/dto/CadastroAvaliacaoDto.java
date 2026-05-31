package br.com.brain.avaliacao.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CadastroAvaliacaoDto(
        @NotBlank String nome,
        @NotNull Long disciplinaId,
        @NotNull Long professorId,
        @NotNull Long turmaId,
        @NotNull BigDecimal notaMaxima,
        String conteudo,
        Boolean notaExtra,
        LocalDate dataAplicacao,
        LocalDate dataEntregaNotas) {
}
