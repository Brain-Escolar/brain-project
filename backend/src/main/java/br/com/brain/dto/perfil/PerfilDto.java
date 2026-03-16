package br.com.brain.dto.perfil;

import br.com.brain.enums.PerfilNome;
import jakarta.validation.constraints.NotNull;

public record PerfilDto(@NotNull PerfilNome perfilNome) {
}
