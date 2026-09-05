package br.com.brain.crm.dto;

import br.com.brain.crm.FunilEstagio;

public record FunilEstagioDto(Long id, String nome, Integer ordem, Integer slaDias) {

    public FunilEstagioDto(FunilEstagio estagio) {
        this(estagio.getId(), estagio.getNome(), estagio.getOrdem(), estagio.getSlaDias());
    }
}
