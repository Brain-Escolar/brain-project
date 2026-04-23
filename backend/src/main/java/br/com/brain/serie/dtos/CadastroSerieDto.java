package br.com.brain.serie.dtos;

import jakarta.validation.constraints.NotBlank;

public record CadastroSerieDto(
        @NotBlank String nome) {
}
