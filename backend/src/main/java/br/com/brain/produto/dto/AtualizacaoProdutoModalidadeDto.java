package br.com.brain.produto.dto;

import java.math.BigDecimal;

public record AtualizacaoProdutoModalidadeDto(
        String modalidade,
        BigDecimal valor,
        Boolean ativo) {
}
