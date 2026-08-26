package br.com.brain.produto.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import br.com.brain.enums.StatusAlunoProduto;
import br.com.brain.produto.AlunoProduto;

public record ListagemAlunoProdutoDto(
        Long id,
        Long alunoId,
        String alunoNome,
        Long produtoModalidadeId,
        String produtoNome,
        String modalidade,
        BigDecimal valorOriginal,
        BigDecimal desconto,
        BigDecimal valorPago,
        LocalDate dataCompra,
        StatusAlunoProduto status) {

    public ListagemAlunoProdutoDto(AlunoProduto alunoProduto) {
        this(
                alunoProduto.getId(),
                alunoProduto.getAluno().getId(),
                alunoProduto.getAluno().getDadosPessoais().getNome(),
                alunoProduto.getProdutoModalidade().getId(),
                alunoProduto.getProdutoModalidade().getProduto().getNome(),
                alunoProduto.getProdutoModalidade().getModalidade(),
                alunoProduto.getProdutoModalidade().getValor(),
                alunoProduto.getDesconto(),
                alunoProduto.getValorPago(),
                alunoProduto.getDataCompra(),
                alunoProduto.getStatus());
    }
}
