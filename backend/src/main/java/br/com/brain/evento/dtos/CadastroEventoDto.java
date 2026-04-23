package br.com.brain.evento.dtos;

import br.com.brain.shared.enums.TipoEvento;
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
