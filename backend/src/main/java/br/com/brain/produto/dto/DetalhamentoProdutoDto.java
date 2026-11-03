package br.com.brain.produto.dto;

import java.util.List;

import br.com.brain.enums.NaturezaProduto;
import br.com.brain.produto.Produto;

public record DetalhamentoProdutoDto(
        Long id,
        String nome,
        String descricao,
        Boolean ativo,
        NaturezaProduto natureza,
        /** Se bolsa pode incidir. Quem decide o teto é a matriz; isto é o gate. */
        Boolean permiteBolsa,
        List<ListagemProdutoModalidadeDto> modalidades) {

    public DetalhamentoProdutoDto(Produto produto, List<ListagemProdutoModalidadeDto> modalidades) {
        this(
                produto.getId(),
                produto.getNome(),
                produto.getDescricao(),
                produto.getAtivo(),
                produto.getNatureza(),
                produto.getPermiteBolsa(),
                modalidades);
    }
}
