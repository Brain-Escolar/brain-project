package br.com.brain.relatorios.dto;

import br.com.brain.configuracaoAcademica.EscalaAvaliacao;

import java.math.BigDecimal;

/** Escala de avaliação da escola exposta aos relatórios (ex.: 0–10, aprovação 6,0). */
public record EscalaDto(
        String type,
        BigDecimal minValue,
        BigDecimal maxValue,
        BigDecimal passingValue,
        Integer decimalPlaces,
        String label) {

    public EscalaDto(EscalaAvaliacao escala) {
        this(
                escala.getTipo().name(),
                escala.getValorMinimo(),
                escala.getValorMaximo(),
                escala.getValorAprovacao(),
                escala.getCasasDecimais(),
                escala.getLabel());
    }
}
