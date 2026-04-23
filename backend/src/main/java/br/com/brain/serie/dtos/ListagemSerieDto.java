package br.com.brain.serie.dtos;

import br.com.brain.serie.domain.Serie;

public record ListagemSerieDto(
        Long id,
        String nome) {

    public ListagemSerieDto(Serie serie) {
        this(
                serie.getId(),
                serie.getNome());
    }
}
