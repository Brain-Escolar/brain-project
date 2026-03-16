package br.com.brain.dto.notas;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;

public record CadastroNotasDto(
        @NotNull Long alunoId,
        @NotNull Long avaliacaoId,
        @NotNull BigDecimal pontuacao,
        @NotNull LocalDate periodoReferencia) {
}
