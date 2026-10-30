package br.com.brain.financeiro.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * O relatorio de inadimplencia com aging.
 *
 * Traz a carteira inteira e nao so o atraso de proposito: 40 mil em atraso e
 * noticia muito diferente se a carteira e 200 mil ou 2 milhoes, e o numero
 * sozinho nao diz qual dos dois e. Por isso tambem vem o percentual.
 *
 * `linhas` traz SO o que esta em atraso -- e a lista de quem a secretaria vai
 * ligar. O que esta a vencer entra nos totais e na faixa A_VENCER, mas nao vira
 * linha: ninguem cobra quem esta em dia.
 */
public record InadimplenciaDto(
        LocalDate referencia,
        Long unidadeId,
        Integer anoLetivo,
        /** Tudo que esta ABERTO no escopo: a vencer mais em atraso. */
        BigDecimal carteiraAberta,
        BigDecimal totalEmAtraso,
        BigDecimal totalAVencer,
        BigDecimal percentualEmAtraso,
        int parcelasEmAtraso,
        /** Alunos distintos com ao menos uma parcela em atraso. */
        int alunosEmAtraso,
        List<FaixaResumoDto> faixas,
        List<InadimplenciaLinhaDto> linhas) {
}
