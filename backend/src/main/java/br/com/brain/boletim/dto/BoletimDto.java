package br.com.brain.boletim.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Boletim completo do aluno em um ano letivo. Toda a regra de negócio
 * (períodos, escala, médias, recuperação, aprovação) é resolvida no backend;
 * o frontend apenas monta a tela a partir deste contrato.
 */
public record BoletimDto(
        Integer anoAcademico,
        BigDecimal notaAprovacao,
        EscalaDto gradingScale,
        List<PeriodoBoletimDto> periodos,
        AlunoBoletimDto aluno,
        ResumoBoletimDto resumo,
        List<DisciplinaBoletimDto> disciplinas) {
}
