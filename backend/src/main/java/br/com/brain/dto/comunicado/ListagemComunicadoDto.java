package br.com.brain.dto.comunicado;

import java.time.LocalDate;

import br.com.brain.domain.comunicado.Comunicado;

public record ListagemComunicadoDto(Long id, String titulo, String conteudo, LocalDate data) {

    public ListagemComunicadoDto(Comunicado comunicado) {
        this(
                comunicado.getId(),
                comunicado.getTitulo(),
                comunicado.getConteudo(),
                comunicado.getData());
    }
}
