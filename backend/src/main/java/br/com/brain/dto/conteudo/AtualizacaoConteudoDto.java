package br.com.brain.dto.conteudo;

import java.time.LocalDate;

public record AtualizacaoConteudoDto(
        String conteudo,
        Long aulaId,
        LocalDate data) {
}
