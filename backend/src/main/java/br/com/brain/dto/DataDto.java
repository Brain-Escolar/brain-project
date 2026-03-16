package br.com.brain.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;

public record DataDto(@NotNull LocalDate data) {
}
