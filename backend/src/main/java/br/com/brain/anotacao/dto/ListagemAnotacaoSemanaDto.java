package br.com.brain.anotacao.dto;

import br.com.brain.anotacao.models.Anotacao;

public record ListagemAnotacaoSemanaDto(
        String disciplina,
        String tipoAnotacao,
        String data,
        String observacao) {

    public ListagemAnotacaoSemanaDto(Anotacao anotacao) {
        this(
                anotacao.getAula().getDisciplina().getNome(),
                anotacao.getTipoAnotacao().getDescricao(),
                anotacao.getDataAnotacao().toString(),
                anotacao.getObservacao());
    }
}
