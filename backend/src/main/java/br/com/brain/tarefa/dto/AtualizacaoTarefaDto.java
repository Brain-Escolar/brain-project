package br.com.brain.tarefa.dto;

import java.time.LocalDate;

public record AtualizacaoTarefaDto(
        String titulo,
        String conteudo,
        Long professorId,
        Long turmaId,
        LocalDate prazo) {
}
