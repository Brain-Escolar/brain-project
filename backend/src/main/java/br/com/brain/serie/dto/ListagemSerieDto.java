package br.com.brain.serie.dto;

import br.com.brain.serie.Serie;

public record ListagemSerieDto(
        Long id,
        String nome) {

    public ListagemSerieDto(Serie serie) {
        this(
                serie.getId(),
                serie.getNome());
    }
}
