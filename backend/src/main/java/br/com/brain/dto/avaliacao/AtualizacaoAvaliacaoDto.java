package br.com.brain.dto.avaliacao;

import java.math.BigDecimal;

public record AtualizacaoAvaliacaoDto(
        String nome,
        Long disciplinaId,
        Long turmaId,
        BigDecimal notaMaxima,
        String conteudo,
        Boolean notaExtra,
        java.time.LocalDate dataAplicacao,
        java.time.LocalDate dataEntregaNotas) {
}
