package br.com.brain.dto.serie;

import jakarta.validation.constraints.NotBlank;

public record AtualizacaoSerieDto(@NotBlank String nome) {
}
