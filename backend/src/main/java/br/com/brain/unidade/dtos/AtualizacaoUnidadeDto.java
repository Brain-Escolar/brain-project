package br.com.brain.unidade.dtos;

import jakarta.validation.constraints.NotBlank;

public record AtualizacaoUnidadeDto(@NotBlank String nome) {
}
