package br.com.brain.dto.aluno;

import br.com.brain.enums.CursoPretendido;
import jakarta.validation.constraints.NotNull;

public record AtualizacaoCursoPretendidoDto(@NotNull CursoPretendido cursoPretendido) {
}
