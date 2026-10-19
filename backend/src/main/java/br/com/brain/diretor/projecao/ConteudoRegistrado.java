package br.com.brain.diretor.projecao;

import java.time.Instant;
import java.time.LocalDate;

/** Conteúdo que o professor lançou para uma aula num dia. */
public record ConteudoRegistrado(Long aulaId, LocalDate data, String conteudo, Instant registradoEm) {
}
