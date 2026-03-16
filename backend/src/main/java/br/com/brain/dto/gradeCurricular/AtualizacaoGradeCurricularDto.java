package br.com.brain.dto.gradeCurricular;

import jakarta.validation.constraints.NotBlank;

public record AtualizacaoGradeCurricularDto(@NotBlank String nome, @NotBlank String versao, @NotBlank Boolean ativo) {
}
