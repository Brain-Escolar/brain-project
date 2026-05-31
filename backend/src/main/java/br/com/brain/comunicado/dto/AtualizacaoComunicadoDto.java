package br.com.brain.comunicado.dto;

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
