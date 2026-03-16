package br.com.brain.dto.unidade;

import br.com.brain.domain.unidade.Unidade;

public record ListagemUnidadeDto(
        Long id,
        String nome) {

    public ListagemUnidadeDto(Unidade unidade) {
        this(
                unidade.getId(),
                unidade.getNome());
    }
}
