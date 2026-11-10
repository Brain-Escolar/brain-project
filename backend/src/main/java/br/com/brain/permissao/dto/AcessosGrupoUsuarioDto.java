package br.com.brain.permissao.dto;

import jakarta.validation.constraints.NotNull;

import java.util.Set;

/** Conjunto completo de telas e controles do grupo: substitui o que havia. */
public record AcessosGrupoUsuarioDto(
        @NotNull Set<String> telas,
        @NotNull Set<String> controles) {
}
