package br.com.brain.dto.mensagem;

import jakarta.validation.constraints.NotBlank;

public record CadastroMensagemDto(
        @NotBlank String conteudo) {
}
