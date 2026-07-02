package br.com.brain.boletim.dto;

import java.math.BigDecimal;

/** Indicadores gerais do boletim (cards de topo na tela). */
public record ResumoBoletimDto(
        BigDecimal mediaGeral,
        Integer frequenciaGeral,
        long emRecuperacao,
        String situacaoFinal) {
}
