package br.com.brain.escolaridade.dto;

import jakarta.validation.constraints.NotBlank;

public record CadastroEscolaridadeDto(
        @NotBlank String descricao) {
}
