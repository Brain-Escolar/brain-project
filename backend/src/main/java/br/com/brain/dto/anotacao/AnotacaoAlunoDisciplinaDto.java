package br.com.brain.dto.anotacao;

import br.com.brain.domain.anotacao.Anotacao;

public record AnotacaoAlunoDisciplinaDto(String tipoAnotacao, String data, String observacao) {

    public AnotacaoAlunoDisciplinaDto(Anotacao anotacao) {
        this(
                anotacao.getTipoAnotacao().getDescricao(),
                anotacao.getDataAnotacao().toString(),
                anotacao.getObservacao());
    }
}
