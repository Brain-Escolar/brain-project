package br.com.brain.permissao.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.Set;

public record AdicaoMembrosDto(@NotEmpty Set<Long> dadosPessoaisIds) {
}
