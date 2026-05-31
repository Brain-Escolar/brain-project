package br.com.brain.unidade.dto;

import jakarta.validation.constraints.NotBlank;

public record AtualizacaoUnidadeDto(@NotBlank String nome) {
}
