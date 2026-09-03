package br.com.brain.comunicado.dto;

import br.com.brain.comunicado.Comunicado;
import br.com.brain.comunicado.ComunicadoDestinatario;
import br.com.brain.enums.ComunicadoCategoriaEnum;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record ListagemComunicadoDto(
        Long id,
        String titulo,
        String conteudo,
        LocalDate data,
        ComunicadoCategoriaEnum categoria,
        String imagemUrl,
        String anexoUrl,
        Long autorId,
        String autorNome,
        Instant dataCriacao,
        List<DestinatarioComunicadoResumoDto> destinatarios) {

    public ListagemComunicadoDto(Comunicado comunicado, String imagemUrl, String anexoUrl, String autorNome,
            List<ComunicadoDestinatario> destinatarios) {
        this(
                comunicado.getId(),
                comunicado.getTitulo(),
                comunicado.getConteudo(),
                comunicado.getData(),
                comunicado.getCategoria(),
                imagemUrl,
                anexoUrl,
                comunicado.getCriadoPor(),
                autorNome,
                comunicado.getCriadoEm(),
                destinatarios.stream().map(DestinatarioComunicadoResumoDto::new).toList());
    }
}
