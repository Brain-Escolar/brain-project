package br.com.brain.shared.perfil;

import br.com.brain.shared.enums.PerfilNome;
import jakarta.validation.constraints.NotNull;

public record PerfilDto(@NotNull PerfilNome perfilNome) {
}
