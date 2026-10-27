package br.com.brain.matricula.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/**
 * Para onde vai quem foi aprovado em cada série. Série sem linha aqui não
 * rematricula os aprovados (o sistema não sabe a ordem das séries);
 * {@code serieDestinoId} nulo marca a série como final (concluintes).
 * Reprovado sempre repete a série.
 */
public record RematriculaRequest(@NotNull List<@Valid Promocao> promocoes) {

    public record Promocao(@NotNull Long serieOrigemId, Long serieDestinoId) {
    }
}
