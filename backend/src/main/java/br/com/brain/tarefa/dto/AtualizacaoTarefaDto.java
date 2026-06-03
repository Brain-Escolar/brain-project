package br.com.brain.tarefa.dto;

import java.time.LocalDate;

public record AtualizacaoTarefaDto(
        String conteudo,
        Long professorId,
        Long aulaId,
        LocalDate prazo) {
}
