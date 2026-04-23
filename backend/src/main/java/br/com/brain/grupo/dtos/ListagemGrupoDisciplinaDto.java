package br.com.brain.grupo.dtos;

import br.com.brain.grupo.domain.GrupoDisciplina;

public record ListagemGrupoDisciplinaDto(Long id, String nome, String area) {

    public ListagemGrupoDisciplinaDto(GrupoDisciplina grupoDisciplina) {
        this(grupoDisciplina.getId(), grupoDisciplina.getNome(), grupoDisciplina.getArea());
    }
}
