package br.com.brain.dto.tarefa;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record CadastroTarefaDto(
        @NotBlank String titulo,
        String conteudo,
        String documentoUrl,
        @NotNull LocalDate prazo) {
}
