package br.com.brain.relatorios.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Relatórios acadêmicos completos do aluno em um ano letivo (notas e
 * frequência). Toda a regra de negócio (períodos, escala, médias, recuperação,
 * aprovação, frequência mínima e limite de faltas) é resolvida no backend; o
 * frontend apenas monta a tela a partir deste contrato.
 */
public record RelatorioDto(
        Integer anoAcademico,
        BigDecimal notaAprovacao,
        BigDecimal frequenciaMinima,
        Integer limiteFaltas,
        Integer percentualLimiteFaltas,
        EscalaDto gradingScale,
        List<PeriodoRelatorioDto> periodos,
        AlunoRelatorioDto aluno,
        ResumoRelatorioDto resumo,
        List<DisciplinaRelatorioDto> disciplinas) {
}
