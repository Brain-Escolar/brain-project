package br.com.brain.planejamentoAnual.dto;

import jakarta.validation.constraints.NotNull;

public record CadastroPlanejamentoAnualDto(
        @NotNull Integer ano) {
}
