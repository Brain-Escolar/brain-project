package br.com.brain.informerendimento.dto;

import jakarta.validation.constraints.NotNull;

public record CadastroInformeRendimentoDto(
        @NotNull Long professorId,
        @NotNull Integer ano,
        Integer mesesConsiderados,
        Boolean completo) {
}
