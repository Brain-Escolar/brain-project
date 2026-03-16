package br.com.brain.dto.disciplina;

public record AtualizacaoDisciplinaDto(
        String nome,
        Long unidadeId,
        Long serieId,
        int cargaHoraria,
        Long grupoId) {
}
