package br.com.brain.serie.dto;

import jakarta.validation.constraints.NotBlank;

public record AtualizacaoSerieDto(@NotBlank String nome) {
}
