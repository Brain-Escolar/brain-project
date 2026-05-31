package br.com.brain.notas.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;

public record NotasAlunosDto(
        @NotNull Long alunoId,
        @NotNull BigDecimal pontuacao) {
}
