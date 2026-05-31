package br.com.brain.usuario.dto;

import jakarta.validation.constraints.NotBlank;

public record RedefinicaoSenhaDto(
        @NotBlank String novaSenha,
        @NotBlank String novaSenhaConfirmacao) {
}
