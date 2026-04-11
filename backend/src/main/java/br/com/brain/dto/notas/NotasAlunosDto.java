package br.com.brain.dto.notas;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;

public record NotasAlunosDto(
        @NotNull Long alunoId,
        @NotNull BigDecimal pontuacao) {
}
