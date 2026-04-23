package br.com.brain.evento.dtos;

import br.com.brain.shared.enums.TipoEvento;

import java.time.LocalDate;

public record AtualizacaoEventoDto(
        String titulo,
        String descricao,
        LocalDate dataEvento,
        TipoEvento tipo,
        Long turmaId,
        Long serieId,
        Long unidadeId,
        Long professorId,
        Long avaliacaoId) {
}
