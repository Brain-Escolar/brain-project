package br.com.brain.disciplina.dto;

public record AtualizacaoDisciplinaDto(
        String nome,
        Long unidadeId,
        Long serieId,
        int cargaHoraria,
        Long grupoId) {
}
