package br.com.brain.dto.tarefa;

import java.time.LocalDate;

public record AtualizacaoTarefaDto(
        String titulo,
        String conteudo,
        String documentoUrl,
        Long professorId,
        LocalDate prazo) {
}
