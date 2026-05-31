package br.com.brain.disciplina.dto;

import br.com.brain.disciplina.models.Disciplina;

public record ListagemDisciplinaDto(
        Long id, String nome, int cargaHoraria, String grupo, String serie) {

    public ListagemDisciplinaDto(Disciplina disciplina) {
        this(
                disciplina.getId(),
                disciplina.getNome(),
                disciplina.getCargaHoraria(),
                disciplina.getGrupo().getNome(),
                disciplina.getSerie() == null ? "Sem serie" : disciplina.getSerie().getNome());
    }
}
