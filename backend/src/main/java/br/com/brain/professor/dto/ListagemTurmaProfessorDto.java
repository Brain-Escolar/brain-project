package br.com.brain.professor.dto;

import java.math.BigDecimal;

public record ListagemTurmaProfessorDto(
        Long turmaId,
        String serieNome,
        String nomeTurma,
        Integer totalAlunos,
        BigDecimal mediaTurma,
        Integer frequenciaTurma) {
}
