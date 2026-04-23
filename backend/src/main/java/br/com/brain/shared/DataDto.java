package br.com.brain.shared;

import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;

public record DataDto(@NotNull LocalDate data) {
}
