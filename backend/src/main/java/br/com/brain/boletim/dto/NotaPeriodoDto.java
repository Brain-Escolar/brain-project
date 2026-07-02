package br.com.brain.boletim.dto;

import java.math.BigDecimal;

/**
 * Nota e faltas de uma disciplina em um período específico.
 * {@code nota} é nulo quando ainda não há avaliações lançadas no período.
 */
public record NotaPeriodoDto(
        Long periodoId,
        Integer sequence,
        BigDecimal nota,
        Integer faltas) {
}
