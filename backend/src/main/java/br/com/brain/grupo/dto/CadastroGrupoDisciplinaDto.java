package br.com.brain.grupo.dto;

import jakarta.validation.constraints.NotBlank;

public record CadastroGrupoDisciplinaDto(@NotBlank String nome, @NotBlank String area) {
}
