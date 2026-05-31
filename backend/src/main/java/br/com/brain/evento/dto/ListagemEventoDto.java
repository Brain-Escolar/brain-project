package br.com.brain.evento.dto;

import br.com.brain.evento.Evento;
import br.com.brain.enums.TipoEvento;

import java.time.LocalDate;

public record ListagemEventoDto(
        Long id,
        String titulo,
        String descricao,
        LocalDate dataEvento,
        TipoEvento tipo) {

    public ListagemEventoDto(Evento evento) {
        this(
                evento.getId(),
                evento.getTitulo(),
                evento.getDescricao(),
                evento.getDataEvento(),
                evento.getTipo());
    }
}
