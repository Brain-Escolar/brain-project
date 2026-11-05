package br.com.brain.enums;

/**
 * Situacao de uma linha da tabela de precos.
 *
 * So APROVADO precifica proposta -- o filtro esta nas consultas do
 * ProdutoPrecoRepository, nao so na tela. Preco pendente existe, aparece na fila
 * de quem aprova, e nao cobra ninguem.
 */
public enum StatusProdutoPreco {

    /** Cadastrado, esperando decisao. Nao precifica nada. */
    PENDENTE_APROVACAO,

    /** Vale. E o unico status que a proposta ve. */
    APROVADO,

    /**
     * Recusado. Fica na tabela em vez de ser apagado: "pediu 1.500, saiu 1.350"
     * e a historia do reajuste, e em seis meses e a unica resposta para por que
     * o preco deste ano e esse.
     */
    REJEITADO,
}
