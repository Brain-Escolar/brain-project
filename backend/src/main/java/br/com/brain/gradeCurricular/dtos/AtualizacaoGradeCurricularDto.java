package br.com.brain.gradeCurricular.dtos;

import jakarta.validation.constraints.NotBlank;

public record AtualizacaoGradeCurricularDto(@NotBlank String nome, @NotBlank String versao, @NotBlank Boolean ativo) {
}
