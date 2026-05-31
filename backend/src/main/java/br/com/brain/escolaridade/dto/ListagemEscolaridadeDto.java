package br.com.brain.escolaridade.dto;

import br.com.brain.escolaridade.Escolaridade;

public record ListagemEscolaridadeDto(
        Long id,
        String nome) {

    public ListagemEscolaridadeDto(Escolaridade escolaridade) {
        this(
                escolaridade.getId(),
                escolaridade.getDescricao());
    }
}
