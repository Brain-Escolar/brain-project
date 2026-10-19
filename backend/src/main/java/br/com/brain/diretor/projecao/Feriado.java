package br.com.brain.diretor.projecao;

import java.time.LocalDate;

/** Feriado do calendário; {@code unidadeId} nulo vale para a escola inteira. */
public record Feriado(LocalDate data, String titulo, Long unidadeId) {
}
