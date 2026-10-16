package br.com.brain.diretor.painel.dto;

import java.math.BigDecimal;

/** Média das notas regulares de uma série no período letivo corrente. */
public record DesempenhoSerieDto(Long serieId, String serie, BigDecimal media) {
}
