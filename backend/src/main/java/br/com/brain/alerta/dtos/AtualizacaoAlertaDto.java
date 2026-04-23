package br.com.brain.alerta.dtos;

import java.time.LocalDate;

public record AtualizacaoAlertaDto(
        String titulo,
        String conteudo,
        LocalDate data) {
}
