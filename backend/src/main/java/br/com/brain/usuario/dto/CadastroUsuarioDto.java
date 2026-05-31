package br.com.brain.usuario.dto;

import jakarta.validation.constraints.NotBlank;

public record CadastroUsuarioDto(@NotBlank String email, @NotBlank String senha) {
}
