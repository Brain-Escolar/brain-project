package br.com.brain.unidade.dto;

import jakarta.validation.constraints.NotBlank;

public record CadastroUnidadeDto(
        @NotBlank String nome) {
}
