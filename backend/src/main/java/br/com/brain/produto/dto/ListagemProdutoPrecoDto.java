package br.com.brain.produto.dto;

import br.com.brain.enums.Turno;
import br.com.brain.produto.ProdutoPreco;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ListagemProdutoPrecoDto(
        Long id,
        Long modalidadeId,
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
        boolean vigenteHoje) {

    public ListagemProdutoPrecoDto(ProdutoPreco p) {
        this(
                p.getId(),
                p.getModalidade().getId(),
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
                vigenteEm(p, LocalDate.now()));
    }

    private static boolean vigenteEm(ProdutoPreco p, LocalDate data) {
        return !p.getVigenciaInicio().isAfter(data)
                && (p.getVigenciaFim() == null || !p.getVigenciaFim().isBefore(data));
    }
}
