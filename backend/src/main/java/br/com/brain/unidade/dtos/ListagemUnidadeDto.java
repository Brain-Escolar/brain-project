package br.com.brain.unidade.dtos;

import br.com.brain.unidade.domain.Unidade;

public record ListagemUnidadeDto(
        Long id,
        String nome) {

    public ListagemUnidadeDto(Unidade unidade) {
        this(
                unidade.getId(),
                unidade.getNome());
    }
}
