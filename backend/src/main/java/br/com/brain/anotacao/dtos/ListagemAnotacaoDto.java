package br.com.brain.anotacao.dtos;

import br.com.brain.anotacao.domain.Anotacao;

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
