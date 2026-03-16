package br.com.brain.dto.grupo;

import jakarta.validation.constraints.NotBlank;

public record CadastroGrupoDisciplinaDto(@NotBlank String nome, @NotBlank String area) {
}
