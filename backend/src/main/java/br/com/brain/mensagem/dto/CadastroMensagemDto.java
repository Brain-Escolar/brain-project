package br.com.brain.mensagem.dto;

import jakarta.validation.constraints.NotBlank;

public record CadastroMensagemDto(
        @NotBlank String conteudo) {
}
