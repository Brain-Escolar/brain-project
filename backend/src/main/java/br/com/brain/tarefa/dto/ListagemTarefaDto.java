package br.com.brain.tarefa.dto;

import br.com.brain.tarefa.Tarefa;

public record ListagemTarefaDto(
        Long id,
        String conteudo,
        String documentoUrl,
        String professor,
        Long aulaId,
        Long turmaId,
        String turma,
        Long serieId,
        String serie,
        String disciplina,
        Long disciplinaId,
        String prazo) {

    public ListagemTarefaDto(Tarefa tarefa, String downloadUrl) {
        this(
                tarefa.getId(),
                tarefa.getConteudo(),
                downloadUrl,
                tarefa.getProfessor().getDadosPessoais().getNome(),
                tarefa.getAula().getId(),
                tarefa.getAula().getTurma().getId(),
                tarefa.getAula().getTurma().getNome(),
                tarefa.getAula().getTurma().getSerie().getId(),
                tarefa.getAula().getTurma().getSerie().getNome(),
                tarefa.getAula().getDisciplina().getNome(),
                tarefa.getAula().getDisciplina().getId(),
                tarefa.getPrazo().toString());
    }
}
