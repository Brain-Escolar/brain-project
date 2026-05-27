package br.com.brain.dto.tarefa;

import java.time.LocalDate;

public record AtualizacaoTarefaDto(
        String titulo,
        String conteudo,
        Long professorId,
        Long turmaId,
        LocalDate prazo) {
}
