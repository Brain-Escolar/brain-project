package br.com.brain.tarefa.dtos;

import java.time.LocalDate;

public record AtualizacaoTarefaDto(
        String titulo,
        String conteudo,
        String documentoUrl,
        Long professorId,
        Long turmaId,
        LocalDate prazo) {
}
