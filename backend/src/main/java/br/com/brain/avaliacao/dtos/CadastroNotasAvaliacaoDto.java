package br.com.brain.avaliacao.dtos;

import java.time.LocalDate;
import java.util.List;

import br.com.brain.notas.dtos.NotasAlunosDto;
import jakarta.validation.constraints.NotNull;

public record CadastroNotasAvaliacaoDto(
        @NotNull List<NotasAlunosDto> notas,
        @NotNull LocalDate periodoReferencia) {
}
