package br.com.brain.perfil.dto;

import br.com.brain.enums.PerfilNome;
import jakarta.validation.constraints.NotNull;

public record PerfilDto(@NotNull PerfilNome perfilNome) {
}
