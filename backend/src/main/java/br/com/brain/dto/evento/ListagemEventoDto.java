package br.com.brain.dto.evento;

import br.com.brain.domain.evento.Evento;
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
