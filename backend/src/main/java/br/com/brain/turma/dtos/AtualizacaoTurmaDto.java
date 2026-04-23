package br.com.brain.turma.dtos;

import jakarta.validation.constraints.NotBlank;

public record AtualizacaoTurmaDto(@NotBlank String nome, String sala) {
}
