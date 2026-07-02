package br.com.brain.avaliacao.dto;

import java.time.LocalDate;

public record AtualizacaoAvaliacaoTurmaDto(
        Long professorId,
        LocalDate dataAplicacao,
        LocalDate dataEntregaNotas) {
}
