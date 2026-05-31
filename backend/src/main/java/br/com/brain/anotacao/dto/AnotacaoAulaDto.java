package br.com.brain.anotacao.dto;

import br.com.brain.anotacao.Anotacao;

public record AnotacaoAulaDto(Long anotacaoId, String nomeAluno, String anotacao, String observacao) {

    public AnotacaoAulaDto(Anotacao anotacao) {
        this(
                anotacao.getId(),
                anotacao.getAluno().getDadosPessoais().getNome(),
                anotacao.getTipoAnotacao().getDescricao(),
                anotacao.getObservacao());
    }
}
