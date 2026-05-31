package br.com.brain.grupo.dto;

import br.com.brain.grupo.GrupoDisciplina;

public record ListagemGrupoDisciplinaDto(Long id, String nome, String area) {

    public ListagemGrupoDisciplinaDto(GrupoDisciplina grupoDisciplina) {
        this(grupoDisciplina.getId(), grupoDisciplina.getNome(), grupoDisciplina.getArea());
    }
}
