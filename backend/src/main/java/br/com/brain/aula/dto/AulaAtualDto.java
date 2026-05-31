package br.com.brain.aula.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.NotNull;

public record AulaAtualDto(@NotNull LocalDate data, @NotNull LocalTime horario) {
}
