package br.com.brain.anotacao.dto;

import br.com.brain.anotacao.models.Anotacao;

public record AnotacaoAlunoDisciplinaDto(String tipoAnotacao, String data, String observacao) {

    public AnotacaoAlunoDisciplinaDto(Anotacao anotacao) {
        this(
                anotacao.getTipoAnotacao().getDescricao(),
                anotacao.getDataAnotacao().toString(),
                anotacao.getObservacao());
    }
}
