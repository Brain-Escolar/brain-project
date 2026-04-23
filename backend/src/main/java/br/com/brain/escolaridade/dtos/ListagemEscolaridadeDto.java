package br.com.brain.escolaridade.dtos;

import br.com.brain.escolaridade.domain.Escolaridade;

public record ListagemEscolaridadeDto(
        Long id,
        String nome) {

    public ListagemEscolaridadeDto(Escolaridade escolaridade) {
        this(
                escolaridade.getId(),
                escolaridade.getDescricao());
    }
}
