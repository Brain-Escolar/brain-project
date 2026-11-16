package br.com.brain.usuario.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record NovaSenhaDto(
        @NotBlank String token,
        @NotBlank @Size(min = 8, message = "A senha precisa ter pelo menos 8 caracteres.") String novaSenha,
        @NotBlank String novaSenhaConfirmacao) {
}
