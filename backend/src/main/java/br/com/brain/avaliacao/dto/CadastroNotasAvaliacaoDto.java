package br.com.brain.avaliacao.dto;

import java.time.LocalDate;
import java.util.List;

import br.com.brain.notas.dto.NotasAlunosDto;
import jakarta.validation.constraints.NotNull;

public record CadastroNotasAvaliacaoDto(
        @NotNull List<NotasAlunosDto> notas,
        @NotNull LocalDate periodoReferencia) {
}
