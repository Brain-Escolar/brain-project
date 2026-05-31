package br.com.brain.aluno.dto;

import br.com.brain.enums.CursoPretendido;
import jakarta.validation.constraints.NotNull;

public record AtualizacaoCursoPretendidoDto(@NotNull CursoPretendido cursoPretendido) {
}
