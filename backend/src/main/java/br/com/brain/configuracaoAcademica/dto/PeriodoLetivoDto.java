package br.com.brain.configuracaoAcademica.dto;

import br.com.brain.configuracaoAcademica.PeriodoLetivo;

import java.time.Instant;
import java.time.LocalDate;

public record PeriodoLetivoDto(
        Long id,
        Integer sequencia,
        String nome,
        LocalDate dataInicio,
        LocalDate dataFim,
        Instant fechadoEm) {

    public static PeriodoLetivoDto de(PeriodoLetivo periodo) {
        return new PeriodoLetivoDto(periodo.getId(), periodo.getSequencia(), periodo.getNome(),
                periodo.getDataInicio(), periodo.getDataFim(), periodo.getFechadoEm());
    }
}
