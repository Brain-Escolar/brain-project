package br.com.brain.grupo.dtos;

import br.com.brain.grupo.domain.GrupoDisciplina;

public record DetalhamentoGrupoDisciplinaDto(Long id, String nome, String area) {

    public DetalhamentoGrupoDisciplinaDto(GrupoDisciplina grupoDisciplina) {
        this(grupoDisciplina.getId(), grupoDisciplina.getNome(), grupoDisciplina.getArea());
    }
}
