package br.com.brain.boletim.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Linha do boletim de uma disciplina: notas/faltas por período, média anual,
 * recuperação (quando houver), nota final, faltas totais, frequência e situação.
 */
public record DisciplinaBoletimDto(
        Long disciplinaId,
        String nome,
        List<NotaPeriodoDto> periodos,
        BigDecimal notaAnual,
        BigDecimal recuperacao,
        BigDecimal notaFinal,
        Integer totalFaltas,
        Integer frequencia,
        String situacao) {
}
