package br.com.brain.comunicado.dtos;

import java.time.LocalDate;

import br.com.brain.comunicado.domain.Comunicado;

public record ListagemComunicadoDto(Long id, String titulo, String conteudo, LocalDate data) {

    public ListagemComunicadoDto(Comunicado comunicado) {
        this(
                comunicado.getId(),
                comunicado.getTitulo(),
                comunicado.getConteudo(),
                comunicado.getData());
    }
}
