package br.com.brain.dto.escolaridade;

import jakarta.validation.constraints.NotBlank;

public record AtualizacaoEscolaridadeDto(@NotBlank String descricao) {
}
