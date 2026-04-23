package br.com.brain.aula.dtos;

import java.time.LocalDate;
import java.time.LocalTime;

public record ProximaAulaDto(Long aulaId, LocalDate data, LocalTime horarioInicio, LocalTime horarioFim) {
}
