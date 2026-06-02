package br.com.brain.tarefa.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record CadastroTarefaDto(
        @NotBlank String conteudo,
        @NotNull Long turmaId,
        @NotNull LocalDate prazo,
        LocalDate dataCriacao) {
}
