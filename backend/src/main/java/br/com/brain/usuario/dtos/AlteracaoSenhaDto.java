package br.com.brain.usuario.dtos;

import jakarta.validation.constraints.NotBlank;

public record AlteracaoSenhaDto(
        @NotBlank String senhaAtual,
        @NotBlank String novaSenha,
        @NotBlank String novaSenhaConfirmacao) {
}
