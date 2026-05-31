package br.com.brain.conversa.dto;

import br.com.brain.enums.PerfilNome;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CadastroConversaDto(
        @NotBlank String titulo,
        @NotNull PerfilNome destinatarioPerfilNome,
        @NotBlank String primeiraMensagem) {
}
