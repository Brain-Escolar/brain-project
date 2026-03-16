package br.com.brain.dto.escolaridade;

import jakarta.validation.constraints.NotBlank;

public record CadastroEscolaridadeDto(
        @NotBlank String descricao) {
}
