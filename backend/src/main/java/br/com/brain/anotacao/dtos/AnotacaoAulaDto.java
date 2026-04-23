package br.com.brain.anotacao.dtos;

import br.com.brain.anotacao.domain.Anotacao;

public record AnotacaoAulaDto(Long anotacaoId, String nomeAluno, String anotacao, String observacao) {

    public AnotacaoAulaDto(Anotacao anotacao) {
        this(
                anotacao.getId(),
                anotacao.getAluno().getDadosPessoais().getNome(),
                anotacao.getTipoAnotacao().getDescricao(),
                anotacao.getObservacao());
    }
}
