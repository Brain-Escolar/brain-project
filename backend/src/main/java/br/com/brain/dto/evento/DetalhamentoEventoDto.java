package br.com.brain.dto.evento;

import br.com.brain.domain.evento.Evento;
import br.com.brain.enums.TipoEvento;

import java.time.LocalDate;

public record DetalhamentoEventoDto(
        Long id,
        String titulo,
        String descricao,
        LocalDate dataEvento,
        TipoEvento tipo,
        Long turmaId,
        Long serieId,
        Long unidadeId,
        Long professorId,
        Long avaliacaoId) {

    public DetalhamentoEventoDto(Evento evento) {
        this(
                evento.getId(),
                evento.getTitulo(),
                evento.getDescricao(),
                evento.getDataEvento(),
                evento.getTipo(),
                evento.getTurma() != null ? evento.getTurma().getId() : null,
                evento.getSerie() != null ? evento.getSerie().getId() : null,
                evento.getUnidade() != null ? evento.getUnidade().getId() : null,
                evento.getProfessor() != null ? evento.getProfessor().getId() : null,
                evento.getAvaliacao() != null ? evento.getAvaliacao().getId() : null);
    }
}
