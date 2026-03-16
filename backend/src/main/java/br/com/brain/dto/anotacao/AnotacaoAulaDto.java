package br.com.brain.dto.anotacao;

import br.com.brain.domain.anotacao.Anotacao;

public record AnotacaoAulaDto(Long anotacaoId, String nomeAluno, String anotacao) {

    public AnotacaoAulaDto(Anotacao anotacao) {
        this(
                anotacao.getId(),
                anotacao.getAluno().getDadosPessoais().getNome(),
                anotacao.getTipoAnotacao().getDescricao());
    }
}
