package br.com.brain.anotacao.dto;

import br.com.brain.anotacao.models.Anotacao;

public record ListagemAnotacaoDto(
        String aluno, String disciplina, String tipoAnotacao, String data, String observacao) {

    public ListagemAnotacaoDto(Anotacao anotacao) {
        this(
                anotacao.getAluno().getDadosPessoais().getNome(),
                anotacao.getAula().getDisciplina().getNome(),
                anotacao.getTipoAnotacao().getDescricao(),
                anotacao.getDataAnotacao().toString(),
                anotacao.getObservacao());
    }
}
