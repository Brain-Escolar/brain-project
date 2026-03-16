package br.com.brain.dto.comunicado;

import java.time.LocalDate;

import br.com.brain.domain.comunicado.Comunicado;

public record DetalhamentoComunicadoDto(Long id, String titulo, String conteudo, LocalDate data) {

    public DetalhamentoComunicadoDto(Comunicado comunicado) {
        this(
                comunicado.getId(),
                comunicado.getTitulo(),
                comunicado.getConteudo(),
                comunicado.getData());
    }
}
