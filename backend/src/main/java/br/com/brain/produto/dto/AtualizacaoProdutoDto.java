package br.com.brain.produto.dto;

import br.com.brain.enums.NaturezaProduto;

public record AtualizacaoProdutoDto(
        String nome,
        String descricao,
        Boolean ativo,
        NaturezaProduto natureza,
        Boolean permiteBolsa) {
}
