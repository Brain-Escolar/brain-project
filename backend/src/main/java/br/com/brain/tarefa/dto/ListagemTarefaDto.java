package br.com.brain.tarefa.dto;

import br.com.brain.tarefa.Tarefa;

public record ListagemTarefaDto(
        Long id,
        String titulo,
        String conteudo,
        String documentoUrl,
        String professor,
        Long turmaId,
        String turma,
        String prazo) {

    public ListagemTarefaDto(Tarefa tarefa, String downloadUrl) {
        this(
                tarefa.getId(),
                tarefa.getTitulo(),
                tarefa.getConteudo(),
                downloadUrl,
                tarefa.getProfessor().getDadosPessoais().getNome(),
                tarefa.getTurma().getId(),
                tarefa.getTurma().getNome(),
                tarefa.getPrazo().toString());
    }
}
