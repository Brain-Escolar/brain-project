package br.com.brain.relatorios.dto;

import java.math.BigDecimal;

/**
 * Indicadores gerais dos relatórios (cards de topo). Reúne os KPIs de notas
 * (média geral, em recuperação, disciplinas aprovadas, situação final) e os de
 * frequência (frequência geral, total de faltas, disciplinas em alerta).
 */
public record ResumoRelatorioDto(
        BigDecimal mediaGeral,
        BigDecimal frequenciaGeral,
        long emRecuperacao,
        long disciplinasAprovadas,
        int totalDisciplinas,
        int totalFaltas,
        long emAlerta,
        String situacaoFinal) {
}
