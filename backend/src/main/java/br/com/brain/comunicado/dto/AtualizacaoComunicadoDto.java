package br.com.brain.comunicado.dto;

import br.com.brain.enums.ComunicadoCategoriaEnum;
import jakarta.validation.Valid;

import java.time.LocalDate;
import java.util.List;

public record AtualizacaoComunicadoDto(
        String titulo,
        String conteudo,
        LocalDate data,
        ComunicadoCategoriaEnum categoria,
        String imagemUrl,
        String anexoUrl,
        @Valid List<DestinatarioComunicadoDto> destinatarios) {
}
