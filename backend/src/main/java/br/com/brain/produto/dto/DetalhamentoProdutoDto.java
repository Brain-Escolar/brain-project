package br.com.brain.produto.dto;

import java.util.List;

import br.com.brain.produto.Produto;

public record DetalhamentoProdutoDto(
        Long id,
        String nome,
        String descricao,
        Boolean ativo,
        List<ListagemProdutoModalidadeDto> modalidades) {

    public DetalhamentoProdutoDto(Produto produto, List<ListagemProdutoModalidadeDto> modalidades) {
        this(
                produto.getId(),
                produto.getNome(),
                produto.getDescricao(),
                produto.getAtivo(),
                modalidades);
    }
}
