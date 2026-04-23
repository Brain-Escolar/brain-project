package br.com.brain.grupo.dtos;

import jakarta.validation.constraints.NotBlank;

public record CadastroGrupoDisciplinaDto(@NotBlank String nome, @NotBlank String area) {
}
