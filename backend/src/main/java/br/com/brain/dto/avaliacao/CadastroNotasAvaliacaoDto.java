package br.com.brain.dto.avaliacao;

import java.time.LocalDate;
import java.util.List;

import br.com.brain.dto.notas.NotasAlunosDto;
import jakarta.validation.constraints.NotNull;

public record CadastroNotasAvaliacaoDto(
        @NotNull List<NotasAlunosDto> notas,
        @NotNull LocalDate periodoReferencia) {
}
