package br.com.brain.dto.tarefa;

import br.com.brain.domain.tarefa.Tarefa;

public record ListagemTarefaDto(
        Long id,
        String titulo,
        String conteudo,
        String documentoUrl,
        String professor,
        Long turmaId,
        String turma,
        String prazo) {

    public ListagemTarefaDto(Tarefa tarefa) {
        this(
                tarefa.getId(),
                tarefa.getTitulo(),
                tarefa.getConteudo(),
                tarefa.getDocumentoUrl(),
                tarefa.getProfessor().getDadosPessoais().getNome(),
                tarefa.getTurma().getId(),
                tarefa.getTurma().getNome(),
                tarefa.getPrazo().toString());
    }
}
