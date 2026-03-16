package br.com.brain.dto.disciplina;

import br.com.brain.domain.disciplina.Disciplina;

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
