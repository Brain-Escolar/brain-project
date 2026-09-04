package br.com.brain.fichamedica.dto;

import jakarta.validation.constraints.NotNull;

public record CadastroLaudoDto(
        @NotNull String tipo,
        String observacao) {
}
