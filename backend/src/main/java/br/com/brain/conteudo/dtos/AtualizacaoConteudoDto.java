package br.com.brain.conteudo.dtos;

import java.time.LocalDate;

public record AtualizacaoConteudoDto(
        String conteudo,
        Long aulaId,
        LocalDate data) {
}
