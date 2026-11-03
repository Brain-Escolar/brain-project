package br.com.brain.produto.dto;

/**
 * A decisao sobre um pedido de preco.
 *
 * Nenhum valor entra aqui de proposito: aprovar e aprovar o que foi pedido, nao
 * negociar um terceiro numero. Preco diferente e outro pedido -- assim os dois
 * ficam na tabela e o historico continua inteiro.
 */
public record DecisaoPrecoRequest(

        /** Obrigatorio na recusa, opcional na aprovacao. */
        String motivo) {
}
