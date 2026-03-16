package br.com.brain.dto.unidade;

import jakarta.validation.constraints.NotBlank;

public record AtualizacaoUnidadeDto(@NotBlank String nome) {
}
