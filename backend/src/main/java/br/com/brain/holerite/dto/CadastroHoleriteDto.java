package br.com.brain.holerite.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CadastroHoleriteDto(
        @NotNull Long professorId,
        @NotNull Integer ano,
        @NotNull @Min(1) @Max(12) Integer mes) {
}
