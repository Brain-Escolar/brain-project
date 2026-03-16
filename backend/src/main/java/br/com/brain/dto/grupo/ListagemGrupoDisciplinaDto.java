package br.com.brain.dto.grupo;

import br.com.brain.domain.grupo.GrupoDisciplina;

public record ListagemGrupoDisciplinaDto(Long id, String nome, String area) {

    public ListagemGrupoDisciplinaDto(GrupoDisciplina grupoDisciplina) {
        this(grupoDisciplina.getId(), grupoDisciplina.getNome(), grupoDisciplina.getArea());
    }
}
