package br.com.brain.produto.dto;

import br.com.brain.produto.Produto;

public record ListagemProdutoDto(
        Long id,
        String nome,
        String descricao,
        Boolean ativo) {

    public ListagemProdutoDto(Produto produto) {
        this(
                produto.getId(),
                produto.getNome(),
                produto.getDescricao(),
                produto.getAtivo());
    }
}
