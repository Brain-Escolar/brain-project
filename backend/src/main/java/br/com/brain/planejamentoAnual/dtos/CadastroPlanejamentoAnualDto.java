package br.com.brain.planejamentoAnual.dtos;

import jakarta.validation.constraints.NotNull;

public record CadastroPlanejamentoAnualDto(
        @NotNull Integer ano) {
}
