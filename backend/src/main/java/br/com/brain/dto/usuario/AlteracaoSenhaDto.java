package br.com.brain.dto.usuario;

import jakarta.validation.constraints.NotBlank;

public record AlteracaoSenhaDto(
        @NotBlank String senhaAtual,
        @NotBlank String novaSenha,
        @NotBlank String novaSenhaConfirmacao) {
}
