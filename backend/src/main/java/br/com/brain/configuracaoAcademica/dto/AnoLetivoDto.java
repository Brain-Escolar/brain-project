package br.com.brain.configuracaoAcademica.dto;

import br.com.brain.configuracaoAcademica.AnoLetivo;
import br.com.brain.configuracaoAcademica.PeriodoLetivo;
import br.com.brain.enums.StatusAnoLetivo;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record AnoLetivoDto(
        Integer ano,
        StatusAnoLetivo status,
        LocalDate dataInicio,
        LocalDate dataFim,
        Instant abertoEm,
        Instant encerradoEm,
        List<PeriodoLetivoDto> periodos) {

    public static AnoLetivoDto de(AnoLetivo ano, List<PeriodoLetivo> periodos) {
        return new AnoLetivoDto(ano.getAno(), ano.getStatus(), ano.getDataInicio(), ano.getDataFim(),
                ano.getAbertoEm(), ano.getEncerradoEm(),
                periodos.stream().map(PeriodoLetivoDto::de).toList());
    }
}
