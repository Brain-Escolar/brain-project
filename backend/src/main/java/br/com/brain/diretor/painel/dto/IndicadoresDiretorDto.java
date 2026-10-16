package br.com.brain.diretor.painel.dto;

import java.math.BigDecimal;

/**
 * Números do topo do painel da Direção. Frequência e média vêm do período
 * letivo corrente e do anterior, para o front mostrar a variação; ficam nulos
 * quando ainda não há chamada ou nota lançada no período.
 */
public record IndicadoresDiretorDto(
        long alunosMatriculados,
        long professoresAtivos,
        long unidades,
        long turmas,
        long series,
        long disciplinas,
        String periodoAtual,
        String periodoAnterior,
        BigDecimal frequenciaMedia,
        BigDecimal frequenciaPeriodoAnterior,
        BigDecimal mediaGeral,
        BigDecimal mediaPeriodoAnterior,
        BigDecimal notaAprovacao,
        BigDecimal notaMaxima) {
}
