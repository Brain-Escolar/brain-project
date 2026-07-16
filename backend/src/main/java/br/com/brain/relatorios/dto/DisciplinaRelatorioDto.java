package br.com.brain.relatorios.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Linha de relatório de uma disciplina: notas/faltas por período, média anual,
 * recuperação (quando houver), nota final, faltas totais, frequência e situação.
 */
public record DisciplinaRelatorioDto(
        Long disciplinaId,
        String nome,
        List<NotaPeriodoDto> periodos,
        BigDecimal notaAnual,
        BigDecimal recuperacao,
        BigDecimal notaFinal,
        Integer totalFaltas,
        BigDecimal frequencia,
        String situacao) {
}
