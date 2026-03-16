package br.com.brain.dto.serie;

import br.com.brain.domain.serie.Serie;

public record ListagemSerieDto(
        Long id,
        String nome) {

    public ListagemSerieDto(Serie serie) {
        this(
                serie.getId(),
                serie.getNome());
    }
}
