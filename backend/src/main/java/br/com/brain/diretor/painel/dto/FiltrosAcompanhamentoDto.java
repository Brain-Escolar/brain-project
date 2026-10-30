package br.com.brain.diretor.painel.dto;

import java.util.List;

/** Opções dos filtros do acompanhamento por turma no ano letivo corrente. */
public record FiltrosAcompanhamentoDto(
        int anoLetivo,
        List<PeriodoFiltroDto> periodos,
        List<TurmaFiltroDto> turmas) {

    /** {@code iniciado}: o período já começou; {@code atual}: hoje está dentro dele. */
    public record PeriodoFiltroDto(Integer sequencia, String nome, boolean iniciado, boolean atual) {
    }

    public record TurmaFiltroDto(
            Long id,
            String nome,
            String serie,
            Long unidadeId,
            String unidade,
            String turno,
            String sala) {
    }
}
