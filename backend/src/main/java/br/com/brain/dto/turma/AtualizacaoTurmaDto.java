package br.com.brain.dto.turma;

import jakarta.validation.constraints.NotBlank;

public record AtualizacaoTurmaDto(@NotBlank String nome, String sala) {
}
