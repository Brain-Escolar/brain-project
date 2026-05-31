package br.com.brain.conteudo.dto;

import java.time.LocalDate;

public record AtualizacaoConteudoDto(
        String conteudo,
        Long aulaId,
        LocalDate data) {
}
