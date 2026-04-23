package br.com.brain.escolaridade.dtos;

import jakarta.validation.constraints.NotBlank;

public record AtualizacaoEscolaridadeDto(@NotBlank String descricao) {
}
