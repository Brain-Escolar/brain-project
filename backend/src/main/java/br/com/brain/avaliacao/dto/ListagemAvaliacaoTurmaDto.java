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
        Long periodoLetivoId,
        String periodo,
        boolean periodoFechado,
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
                avaliacaoTurma.getPeriodoLetivo() == null ? null : avaliacaoTurma.getPeriodoLetivo().getId(),
                avaliacaoTurma.getPeriodoLetivo() == null ? null : avaliacaoTurma.getPeriodoLetivo().getNome(),
                avaliacaoTurma.getPeriodoLetivo() != null && avaliacaoTurma.getPeriodoLetivo().isFechado(),
                totalAlunos,
                alunosCorrigidos);
    }
}
