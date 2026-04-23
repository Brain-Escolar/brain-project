package br.com.brain.gradeCurricular.dtos;

import jakarta.validation.constraints.NotBlank;

public record CadastroGradeCurricularDto(
        @NotBlank String nome,
        @NotBlank String versao,
        @NotBlank Boolean ativo) {
}
