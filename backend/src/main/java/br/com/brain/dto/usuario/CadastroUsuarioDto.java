package br.com.brain.dto.usuario;

import jakarta.validation.constraints.NotBlank;

public record CadastroUsuarioDto(@NotBlank String email, @NotBlank String senha) {
}
