package br.com.brain.atendimentoPsicologico.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CadastroAtendimentoPsicologicoDto(
        @NotNull LocalDate data,
        String profissional,
        @NotBlank String descricao,
        /** Id de um laudo da ficha médica do próprio aluno. Opcional. */
        Long laudoId) {
}
