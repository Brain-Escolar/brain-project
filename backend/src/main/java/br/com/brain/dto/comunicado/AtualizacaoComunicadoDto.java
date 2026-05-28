package br.com.brain.dto.comunicado;

import br.com.brain.enums.ComunicadoCategoriaEnum;

import java.time.LocalDate;

public record AtualizacaoComunicadoDto(
        String titulo,
        String conteudo,
        LocalDate data,
        ComunicadoCategoriaEnum categoria,
        String imagemUrl,
        String anexoUrl) {
}
