package br.com.brain.turma.dto;

import br.com.brain.turma.Turma;

public record ListagemTurmaDto(
        Long id,
        String unidade,
        String serie,
        Long unidadeId,
        Long serieId,
        String nome,
        String turno,
        int vagas,
        int ocupadas,
        String sala) {

    public ListagemTurmaDto(Turma turma, int ocupadas) {
        this(
                turma.getId(),
                turma.getUnidade().getNome(),
                turma.getSerie().getNome(),
                turma.getUnidade().getId(),
                turma.getSerie().getId(),
                turma.getNome(),
                turma.getTurno().toString(),
                turma.getVagas(),
                ocupadas,
                turma.getSala());
    }
}
