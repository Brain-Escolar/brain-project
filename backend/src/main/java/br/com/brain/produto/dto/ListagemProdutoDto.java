package br.com.brain.produto.dto;

import br.com.brain.enums.NaturezaProduto;
import br.com.brain.produto.Produto;

public record ListagemProdutoDto(
        Long id,
        String nome,
        String descricao,
        Boolean ativo,
        NaturezaProduto natureza,
        Boolean permiteBolsa) {

    public ListagemProdutoDto(Produto produto) {
        this(
                produto.getId(),
                produto.getNome(),
                produto.getDescricao(),
                produto.getAtivo(),
                produto.getNatureza(),
                produto.getPermiteBolsa());
    }
}
