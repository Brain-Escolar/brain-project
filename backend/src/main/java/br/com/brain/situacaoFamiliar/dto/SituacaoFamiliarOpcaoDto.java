package br.com.brain.situacaoFamiliar.dto;

import br.com.brain.situacaoFamiliar.SituacaoFamiliarOpcao;

public record SituacaoFamiliarOpcaoDto(
        Long id,
        String descricao) {

    public SituacaoFamiliarOpcaoDto(SituacaoFamiliarOpcao opcao) {
        this(opcao.getId(), opcao.getDescricao());
    }
}
