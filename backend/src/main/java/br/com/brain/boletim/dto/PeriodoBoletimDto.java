package br.com.brain.boletim.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/** Cabeçalho de um período letivo no boletim (bimestre/trimestre/...). */
public record PeriodoBoletimDto(
        Long id,
        String name,
        Integer sequence,
        @JsonProperty("isCurrent") boolean isCurrent) {
}
