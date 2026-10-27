package br.com.brain.avaliacao.dto;

import java.time.LocalDate;

public record AtualizacaoAvaliacaoTurmaDto(
        Long professorId,
        LocalDate dataAplicacao,
        LocalDate dataEntregaNotas,
        /** Opcional: sem ele, o período que contém a data de aplicação. */
        Long periodoLetivoId) {
}
