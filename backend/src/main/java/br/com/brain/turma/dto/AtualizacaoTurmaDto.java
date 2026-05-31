package br.com.brain.turma.dto;

import jakarta.validation.constraints.NotBlank;

public record AtualizacaoTurmaDto(@NotBlank String nome, String sala) {
}
