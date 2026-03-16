package br.com.brain.dto.turma;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CadastroTurmaDto(
        @NotBlank String nome,
        @NotNull Long unidadeId,
        @NotNull Long serieId,
        @NotNull Integer anoLetivo,
        @NotNull String turno,
        @NotNull int vagas,
        String sala) {
}
