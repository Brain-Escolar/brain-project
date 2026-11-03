package br.com.brain.produto.dto;

import br.com.brain.enums.NaturezaProduto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * `natureza` e obrigatoria de proposito, mesmo sendo nova.
 *
 * E ela que diz se o item e cobrado todo mes (RECORRENTE), uma vez no ano
 * (UNICO) ou avulso (EVENTUAL) -- e a simulacao usa isso para montar o carne. Um
 * produto cadastrado sem natureza entra no catalogo e some da proposta sem erro
 * nenhum aparecer, que e o pior jeito de falhar.
 */
public record CadastroProdutoDto(
        @NotBlank String nome,
        String descricao,

        @NotNull(message = "Informe se o produto é cobrado todo mês, uma vez no ano ou avulso.")
        NaturezaProduto natureza,

        /** Se bolsa pode incidir sobre este item. Omitido, não permite. */
        Boolean permiteBolsa) {
}
