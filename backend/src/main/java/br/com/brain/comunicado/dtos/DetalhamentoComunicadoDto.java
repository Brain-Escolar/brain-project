package br.com.brain.comunicado.dtos;

import java.time.LocalDate;

import br.com.brain.comunicado.domain.Comunicado;

public record DetalhamentoComunicadoDto(Long id, String titulo, String conteudo, LocalDate data) {

    public DetalhamentoComunicadoDto(Comunicado comunicado) {
        this(
                comunicado.getId(),
                comunicado.getTitulo(),
                comunicado.getConteudo(),
                comunicado.getData());
    }
}
