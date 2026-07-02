package br.com.brain.tarefa.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record CadastroTarefaConteudoLoteDto(
        @NotNull LocalDate semanaInicio,
        @NotNull @Min(1) Integer numeroAula,
        @NotNull Long serieId,
        @NotNull Long disciplinaId,
        @NotBlank String conteudo,
        boolean addTarefa,
        String tarefa,
        @NotEmpty List<Long> turmaIds) {
}
