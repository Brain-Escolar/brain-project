package br.com.brain.grupo.dto;

import br.com.brain.grupo.models.GrupoDisciplina;

public record DetalhamentoGrupoDisciplinaDto(Long id, String nome, String area) {

    public DetalhamentoGrupoDisciplinaDto(GrupoDisciplina grupoDisciplina) {
        this(grupoDisciplina.getId(), grupoDisciplina.getNome(), grupoDisciplina.getArea());
    }
}
