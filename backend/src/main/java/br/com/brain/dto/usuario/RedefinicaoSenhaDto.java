package br.com.brain.dto.usuario;

import jakarta.validation.constraints.NotBlank;

public record RedefinicaoSenhaDto(
        @NotBlank String novaSenha,
        @NotBlank String novaSenhaConfirmacao) {
}
