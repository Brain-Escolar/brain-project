package br.com.brain.dto.evento;

import br.com.brain.enums.TipoEvento;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record CadastroEventoDto(
        @NotBlank String titulo,
        String descricao,
        @NotNull LocalDate dataEvento,
        @NotNull TipoEvento tipo,
        Long turmaId,
        Long serieId,
        Long unidadeId,
        Long professorId,
        Long avaliacaoId) {
}
