package br.com.brain.relatorios.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/** Cabeçalho de um período letivo nos relatórios (bimestre/trimestre/...). */
public record PeriodoRelatorioDto(
        Long id,
        String name,
        Integer sequence,
        @JsonProperty("isCurrent") boolean isCurrent) {
}
