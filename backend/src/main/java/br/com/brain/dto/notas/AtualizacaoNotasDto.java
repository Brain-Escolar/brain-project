package br.com.brain.dto.notas;

import java.math.BigDecimal;
import java.time.LocalDate;

public record AtualizacaoNotasDto(
        Long alunoId,
        Long avaliacaoId,
        BigDecimal pontuacao,
        LocalDate periodoReferencia) {
}
