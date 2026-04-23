package br.com.brain.comunicado.dtos;

import java.time.LocalDate;

public record AtualizacaoComunicadoDto(
        String titulo,
        String conteudo,
        LocalDate data) {
}
