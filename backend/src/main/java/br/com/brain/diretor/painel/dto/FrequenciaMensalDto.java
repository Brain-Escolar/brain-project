package br.com.brain.diretor.painel.dto;

import java.math.BigDecimal;

/** Frequência da escola num mês (% de presenças sobre chamadas registradas). */
public record FrequenciaMensalDto(int ano, int mes, BigDecimal frequencia) {
}
