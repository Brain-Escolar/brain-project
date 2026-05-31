package br.com.brain.unidade.dto;

import br.com.brain.unidade.models.Unidade;

public record ListagemUnidadeDto(
        Long id,
        String nome) {

    public ListagemUnidadeDto(Unidade unidade) {
        this(
                unidade.getId(),
                unidade.getNome());
    }
}
