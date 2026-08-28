package br.com.brain.turma.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record VincularAlunosDto(@NotEmpty List<Long> alunoIds) {
}
