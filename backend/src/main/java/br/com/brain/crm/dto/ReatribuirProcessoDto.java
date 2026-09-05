package br.com.brain.crm.dto;

import jakarta.validation.constraints.NotNull;

public record ReatribuirProcessoDto(@NotNull Long funcionarioId) {
}
