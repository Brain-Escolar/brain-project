package br.com.brain.dto.avaliacao;

import java.math.BigDecimal;

public record AtualizacaoAvaliacaoDto(
        String nome,
        Long disciplinaId,
        BigDecimal peso,
        String conteudo,
        Boolean notaExtra) {
}
