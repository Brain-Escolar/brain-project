package br.com.brain.dto.chamada;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.constraints.NotNull;

public record CadastroChamadaDto(
        @NotNull Long aulaId,
        @NotNull List<PresencaAlunoDto> presencas,
        @NotNull LocalDate data) {
}
