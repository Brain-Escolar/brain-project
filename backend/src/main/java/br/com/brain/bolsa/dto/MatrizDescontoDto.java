package br.com.brain.bolsa.dto;

import br.com.brain.bolsa.MatrizDesconto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MatrizDescontoDto(
        Long id,
        Long politicaId,
        Long tipoBolsaId,
        String tipoBolsa,
        Long unidadeId,
        Long serieId,
        BigDecimal percentualMax,
        LocalDate vigenciaInicio,
        LocalDate vigenciaFim,
        /**
         * Peso da especificidade (serie vale 2, unidade 1). Exposto porque a tela
         * precisa explicar por que uma regra venceu a outra -- sem isso o
         * funcionario ve duas linhas e nao sabe qual valeu.
         */
        Integer especificidade,
        /** Se esta valendo hoje. Regra futura e regra encerrada aparecem na lista. */
        Boolean vigenteHoje) {

    public MatrizDescontoDto(MatrizDesconto m) {
        this(
                m.getId(),
                m.getPolitica().getId(),
                m.getTipoBolsa().getId(),
                m.getTipoBolsa().getNome(),
                m.getUnidade() == null ? null : m.getUnidade().getId(),
                m.getSerie() == null ? null : m.getSerie().getId(),
                m.getPercentualMax(),
                m.getVigenciaInicio(),
                m.getVigenciaFim(),
                m.especificidade(),
                vigenteEm(m, LocalDate.now()));
    }

    private static boolean vigenteEm(MatrizDesconto m, LocalDate data) {
        return !m.getVigenciaInicio().isAfter(data)
                && (m.getVigenciaFim() == null || !m.getVigenciaFim().isBefore(data));
    }
}
