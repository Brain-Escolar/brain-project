package br.com.brain.fichamedica.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;

public record CadastroMedicacaoDto(
        @NotNull String tipoUso,
        LocalDate dataInicio,
        LocalDate dataFim,
        String medicamentos,
        String observacao) {
}
