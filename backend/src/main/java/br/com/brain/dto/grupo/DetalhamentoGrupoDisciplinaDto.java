package br.com.brain.dto.grupo;

import br.com.brain.domain.grupo.GrupoDisciplina;

public record DetalhamentoGrupoDisciplinaDto(Long id, String nome, String area) {

    public DetalhamentoGrupoDisciplinaDto(GrupoDisciplina grupoDisciplina) {
        this(grupoDisciplina.getId(), grupoDisciplina.getNome(), grupoDisciplina.getArea());
    }
}
