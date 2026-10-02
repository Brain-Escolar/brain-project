package br.com.brain.situacaoFamiliar.dto;

import java.util.List;

public record AtualizacaoSituacaoFamiliarDto(
        String descricao,
        /** Substitui o conjunto atual de marcações; null mantém o que já existe. */
        List<Long> opcoesMarcadas) {
}
