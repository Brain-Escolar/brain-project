package br.com.brain.crm.dto;

import br.com.brain.crm.OrigemLead;

public record OrigemLeadDto(Long id, String nome) {

    public OrigemLeadDto(OrigemLead origem) {
        this(origem.getId(), origem.getNome());
    }
}
