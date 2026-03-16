package br.com.brain.dto.anotacao;

import br.com.brain.domain.anotacao.Anotacao;

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
