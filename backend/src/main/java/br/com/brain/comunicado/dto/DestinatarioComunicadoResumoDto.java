package br.com.brain.comunicado.dto;

import br.com.brain.comunicado.ComunicadoDestinatario;
import br.com.brain.enums.ComunicadoAbrangenciaEnum;
import br.com.brain.enums.ComunicadoPublicoEnum;

public record DestinatarioComunicadoResumoDto(
        ComunicadoPublicoEnum publico,
        ComunicadoAbrangenciaEnum abrangencia,
        Long turmaId,
        String turmaNome,
        Long serieId,
        String serieNome) {

    public DestinatarioComunicadoResumoDto(ComunicadoDestinatario destinatario) {
        this(
                destinatario.getPublico(),
                destinatario.getAbrangencia(),
                destinatario.getTurma() != null ? destinatario.getTurma().getId() : null,
                destinatario.getTurma() != null ? destinatario.getTurma().getNome() : null,
                destinatario.getSerie() != null ? destinatario.getSerie().getId() : null,
                destinatario.getSerie() != null ? destinatario.getSerie().getNome() : null);
    }
}
