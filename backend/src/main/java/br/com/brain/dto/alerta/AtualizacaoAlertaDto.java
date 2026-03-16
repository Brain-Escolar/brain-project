package br.com.brain.dto.alerta;

import java.time.LocalDate;

public record AtualizacaoAlertaDto(
        String titulo,
        String conteudo,
        LocalDate data) {
}
