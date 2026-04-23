package br.com.brain.escolaridade.dtos;

import jakarta.validation.constraints.NotBlank;

public record CadastroEscolaridadeDto(
        @NotBlank String descricao) {
}
