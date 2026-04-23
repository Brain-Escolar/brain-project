package br.com.brain.anotacao.dtos;

import br.com.brain.anotacao.domain.Anotacao;

public record AnotacaoAlunoDisciplinaDto(String tipoAnotacao, String data, String observacao) {

    public AnotacaoAlunoDisciplinaDto(Anotacao anotacao) {
        this(
                anotacao.getTipoAnotacao().getDescricao(),
                anotacao.getDataAnotacao().toString(),
                anotacao.getObservacao());
    }
}
