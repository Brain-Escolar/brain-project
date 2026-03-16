package br.com.brain.dto.planejamentoAnual;

import jakarta.validation.constraints.NotNull;

public record CadastroPlanejamentoAnualDto(
        @NotNull Integer ano) {
}
