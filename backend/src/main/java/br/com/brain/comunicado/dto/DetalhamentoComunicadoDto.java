package br.com.brain.comunicado.dto;

import br.com.brain.comunicado.models.Comunicado;
import br.com.brain.enums.ComunicadoCategoriaEnum;

import java.time.LocalDate;

public record DetalhamentoComunicadoDto(
        Long id,
        String titulo,
        String conteudo,
        LocalDate data,
        ComunicadoCategoriaEnum categoria,
        String imagemUrl,
        String anexoUrl) {

    public DetalhamentoComunicadoDto(Comunicado comunicado) {
        this(
                comunicado.getId(),
                comunicado.getTitulo(),
                comunicado.getConteudo(),
                comunicado.getData(),
                comunicado.getCategoria(),
                comunicado.getImagemUrl(),
                comunicado.getAnexoUrl());
    }
}
