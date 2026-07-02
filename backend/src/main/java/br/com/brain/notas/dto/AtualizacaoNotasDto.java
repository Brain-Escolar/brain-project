package br.com.brain.notas.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record AtualizacaoNotasDto(
        Long alunoId,
        Long avaliacaoTurmaId,
        BigDecimal pontuacao,
        LocalDate periodoReferencia) {
}
