package br.com.brain.avaliacao.dto;

import java.math.BigDecimal;

import br.com.brain.enums.TipoAvaliacao;

public record AtualizacaoAvaliacaoDto(
        String nome,
        Long disciplinaId,
        TipoAvaliacao tipo,
        BigDecimal notaMaxima,
        String conteudo,
        Boolean notaExtra) {
}
