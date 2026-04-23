package br.com.brain.unidade.dtos;

import jakarta.validation.constraints.NotBlank;

public record CadastroUnidadeDto(
        @NotBlank String nome) {
}
