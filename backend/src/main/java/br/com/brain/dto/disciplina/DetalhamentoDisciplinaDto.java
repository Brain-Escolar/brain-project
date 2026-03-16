package br.com.brain.dto.disciplina;

import br.com.brain.domain.disciplina.Disciplina;

public record DetalhamentoDisciplinaDto(
        Long id, String nome, int cargaHoraria, String grupo, String serie) {

    public DetalhamentoDisciplinaDto(Disciplina disciplina) {
        this(
                disciplina.getId(),
                disciplina.getNome(),
                disciplina.getCargaHoraria(),
                disciplina.getGrupo().getNome(),
                disciplina.getSerie() == null ? "Sem serie" : disciplina.getSerie().getNome());
    }
}
