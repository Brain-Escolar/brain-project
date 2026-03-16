package br.com.brain.dto.escolaridade;

import br.com.brain.domain.escolaridade.Escolaridade;

public record ListagemEscolaridadeDto(
        Long id,
        String nome) {

    public ListagemEscolaridadeDto(Escolaridade escolaridade) {
        this(
                escolaridade.getId(),
                escolaridade.getDescricao());
    }
}
