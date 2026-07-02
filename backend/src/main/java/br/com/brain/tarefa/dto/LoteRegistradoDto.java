package br.com.brain.tarefa.dto;

import java.util.List;

public record LoteRegistradoDto(
        int turmasRegistradas,
        int tarefasCriadas,
        List<ListagemTarefaDto> tarefas) {
}
