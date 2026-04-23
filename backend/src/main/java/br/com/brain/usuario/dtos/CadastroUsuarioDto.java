package br.com.brain.usuario.dtos;

import jakarta.validation.constraints.NotBlank;

public record CadastroUsuarioDto(@NotBlank String email, @NotBlank String senha) {
}
