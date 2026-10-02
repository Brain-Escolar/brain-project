package br.com.brain.documentoEscolar.dto;

import java.math.BigDecimal;

/** Um ano letivo no histórico: onde foi cursado, carga horária, frequência e resultado. */
public record AnoHistoricoDto(
        Integer anoLetivo,
        String serie,
        String turma,
        String unidade,
        boolean emCurso,
        Integer cargaHoraria,
        BigDecimal frequencia,
        String situacao) {
}
