package br.com.brain.turma.dto;

import br.com.brain.turma.Turma;

public record ListagemTurmaDto(
        Long id,
        String unidade,
        String serie,
        String nome,
        String turno,
        int vagas,
        String sala) {

    public ListagemTurmaDto(Turma turma) {
        this(
                turma.getId(),
                turma.getUnidade().getNome(),
                turma.getSerie().getNome(),
                turma.getNome(),
                turma.getTurno().toString(),
                turma.getVagas(),
                turma.getSala());
    }
}
