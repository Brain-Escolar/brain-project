package br.com.brain.dto.aula;

import java.time.LocalDate;
import java.time.LocalTime;

public record ProximaAulaDto(LocalDate data, LocalTime horarioInicio, LocalTime horarioFim) {
}
