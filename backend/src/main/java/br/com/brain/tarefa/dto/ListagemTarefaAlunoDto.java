package br.com.brain.tarefa.dto;

import br.com.brain.tarefa.Tarefa;

public record ListagemTarefaAlunoDto(
        Long id,
        String conteudo,
        String documentoUrl,
        String professor,
        String turma,
        String serie,
        String unidade,
        String prazo) {

    public ListagemTarefaAlunoDto(Tarefa tarefa, String downloadUrl) {
        this(
                tarefa.getId(),
                tarefa.getConteudo(),
                downloadUrl,
                tarefa.getProfessor().getDadosPessoais().getNome(),
                tarefa.getAula().getTurma().getNome(),
                tarefa.getAula().getTurma().getSerie().getNome(),
                tarefa.getAula().getTurma().getUnidade().getNome(),
                tarefa.getPrazo().toString());
    }
}
