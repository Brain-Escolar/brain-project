package br.com.brain.dto.comunicado;

import java.time.LocalDate;

public record AtualizacaoComunicadoDto(
        String titulo,
        String conteudo,
        LocalDate data) {
}
