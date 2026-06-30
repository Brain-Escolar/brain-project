package br.com.brain.professor.dto;

import java.util.List;

public record ListagemDisciplinaTurmasProfessorDto(
        Long disciplinaId,
        String nomeDisciplina,
        List<ListagemTurmaProfessorDto> turmas) {
}
