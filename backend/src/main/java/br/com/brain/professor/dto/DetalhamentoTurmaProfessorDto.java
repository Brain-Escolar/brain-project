package br.com.brain.professor.dto;

import java.math.BigDecimal;
import java.util.List;

public record DetalhamentoTurmaProfessorDto(
        Long turmaId,
        Long disciplinaId,
        String nomeDisciplina,
        String serieNome,
        String nomeTurma,
        Integer totalAlunos,
        BigDecimal mediaTurma,
        Integer frequenciaTurma,
        List<DetalhamentoAlunoTurmaDto> alunos) {
}
