package br.com.brain.avaliacao.dto;

import java.time.LocalDate;

import br.com.brain.avaliacao.AvaliacaoTurma;

public record ListagemAvaliacaoTurmaDto(
        Long id,
        Long turmaId,
        String turma,
        String professor,
        LocalDate dataAplicacao,
        LocalDate dataEntregaNotas,
        long totalAlunos,
        long alunosCorrigidos) {

    public ListagemAvaliacaoTurmaDto(AvaliacaoTurma avaliacaoTurma, long totalAlunos, long alunosCorrigidos) {
        this(
                avaliacaoTurma.getId(),
                avaliacaoTurma.getTurma().getId(),
                avaliacaoTurma.getTurma().getNome(),
                avaliacaoTurma.getProfessor() == null
                        ? null
                        : avaliacaoTurma.getProfessor().getDadosPessoais().getNome(),
                avaliacaoTurma.getDataAplicacao(),
                avaliacaoTurma.getDataEntregaNotas(),
                totalAlunos,
                alunosCorrigidos);
    }
}
