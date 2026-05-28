package br.com.brain.dto.comunicado;

import br.com.brain.domain.comunicado.Comunicado;
import br.com.brain.enums.ComunicadoCategoriaEnum;

import java.time.LocalDate;

public record ListagemComunicadoDto(
        Long id,
        String titulo,
        String conteudo,
        LocalDate data,
        ComunicadoCategoriaEnum categoria,
        String imagemUrl,
        String anexoUrl) {

    public ListagemComunicadoDto(Comunicado comunicado) {
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
