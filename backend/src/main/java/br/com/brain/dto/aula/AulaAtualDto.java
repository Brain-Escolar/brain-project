package br.com.brain.dto.aula;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.NotNull;

public record AulaAtualDto(@NotNull LocalDate data, @NotNull LocalTime horario) {
}
