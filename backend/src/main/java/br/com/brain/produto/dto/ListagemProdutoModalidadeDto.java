package br.com.brain.produto.dto;

import java.math.BigDecimal;

import br.com.brain.produto.ProdutoModalidade;

public record ListagemProdutoModalidadeDto(
        Long id,
        Long produtoId,
        String modalidade,
        BigDecimal valor,
        Boolean ativo) {

    public ListagemProdutoModalidadeDto(ProdutoModalidade produtoModalidade) {
        this(
                produtoModalidade.getId(),
                produtoModalidade.getProduto().getId(),
                produtoModalidade.getModalidade(),
                produtoModalidade.getValor(),
                produtoModalidade.getAtivo());
    }
}
