package br.com.brain.dto.anotacao;

import br.com.brain.domain.anotacao.Anotacao;

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
