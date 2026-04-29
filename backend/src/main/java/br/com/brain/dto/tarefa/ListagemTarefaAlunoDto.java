package br.com.brain.dto.tarefa;

import br.com.brain.domain.tarefa.Tarefa;

public record ListagemTarefaAlunoDto(
        Long id,
        String titulo,
        String conteudo,
        String documentoUrl,
        String professor,
        String turma,
        String serie,
        String unidade,
        String prazo) {

    public ListagemTarefaAlunoDto(Tarefa tarefa) {
        this(
                tarefa.getId(),
                tarefa.getTitulo(),
                tarefa.getConteudo(),
                tarefa.getDocumentoUrl(),
                tarefa.getProfessor().getDadosPessoais().getNome(),
                tarefa.getTurma().getNome(),
                tarefa.getTurma().getSerie().getNome(),
                tarefa.getTurma().getUnidade().getNome(),
                tarefa.getPrazo().toString());
    }
}
