package br.com.brain.produto.dto;

import br.com.brain.dadosPessoais.DadosPessoais;
import br.com.brain.enums.StatusProdutoPreco;
import br.com.brain.enums.Turno;
import br.com.brain.produto.ProdutoPreco;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ListagemProdutoPrecoDto(
        Long id,
        Long modalidadeId,
        /**
         * Nome do produto e da modalidade. Sem eles a fila de aprovacao mostra
         * "1.500,00 a partir de janeiro" sem dizer de que -- e quem decide
         * precisa saber se e mensalidade ou taxa de material.
         */
        String produtoNome,
        String modalidadeNome,
        Integer anoLetivo,
        Long unidadeId,
        String unidadeNome,
        Long serieId,
        String serieNome,
        Turno turno,
        BigDecimal valor,
        LocalDate vigenciaInicio,
        LocalDate vigenciaFim,
        /**
         * Quantas dimensões esta linha preenche. A tela ordena por isto para
         * mostrar o preço geral em cima e as exceções embaixo — que é a ordem em
         * que a escola pensa o catálogo.
         */
        int especificidade,
        /** Se vale hoje. Linha futura e linha encerrada convivem na mesma lista. */
        boolean vigenteHoje,
        /** PENDENTE_APROVACAO, APROVADO ou REJEITADO. So APROVADO precifica. */
        StatusProdutoPreco status,
        String solicitadoPor,
        String aprovadoPor,
        String motivoDecisao) {

    public ListagemProdutoPrecoDto(ProdutoPreco p) {
        this(
                p.getId(),
                p.getModalidade().getId(),
                p.getModalidade().getProduto() == null
                        ? null : p.getModalidade().getProduto().getNome(),
                p.getModalidade().getModalidade(),
                p.getAnoLetivo(),
                p.getUnidade() == null ? null : p.getUnidade().getId(),
                p.getUnidade() == null ? null : p.getUnidade().getNome(),
                p.getSerie() == null ? null : p.getSerie().getId(),
                p.getSerie() == null ? null : p.getSerie().getNome(),
                p.getTurno(),
                p.getValor(),
                p.getVigenciaInicio(),
                p.getVigenciaFim(),
                p.especificidade(),
                vigenteEm(p, LocalDate.now()),
                p.getStatus(),
                nomeDe(p.getSolicitadoPor()),
                nomeDe(p.getAprovadoPor()),
                p.getMotivoDecisao());
    }

    private static String nomeDe(DadosPessoais pessoa) {
        return pessoa == null ? null : pessoa.getNome();
    }

    private static boolean vigenteEm(ProdutoPreco p, LocalDate data) {
        return !p.getVigenciaInicio().isAfter(data)
                && (p.getVigenciaFim() == null || !p.getVigenciaFim().isBefore(data));
    }
}
