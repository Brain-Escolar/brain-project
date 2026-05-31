package br.com.brain.alerta.dto;

import java.time.LocalDate;

public record AtualizacaoAlertaDto(
        String titulo,
        String conteudo,
        LocalDate data) {
}
