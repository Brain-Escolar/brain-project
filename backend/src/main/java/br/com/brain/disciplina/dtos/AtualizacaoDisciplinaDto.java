package br.com.brain.disciplina.dtos;

public record AtualizacaoDisciplinaDto(
        String nome,
        Long unidadeId,
        Long serieId,
        int cargaHoraria,
        Long grupoId) {
}
