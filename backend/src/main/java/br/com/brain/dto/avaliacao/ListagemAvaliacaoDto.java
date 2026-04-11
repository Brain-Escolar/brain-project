package br.com.brain.dto.avaliacao;

import java.math.BigDecimal;
import java.time.LocalDate;

import br.com.brain.domain.avaliacao.Avaliacao;

public record ListagemAvaliacaoDto(
        Long id,
        String nome,
        String disciplina,
        String turma,
        BigDecimal notaMaxima,
        String conteudo,
        LocalDate dataAplicacao,
        LocalDate dataEntregaNotas,
        Long totalAlunos,
        Long alunosCorrigidos) {

    public ListagemAvaliacaoDto(Avaliacao avaliacao) {
        this(
                avaliacao.getId(),
                avaliacao.getNome(),
                avaliacao.getDisciplina().getNome(),
                avaliacao.getTurma() == null ? null : avaliacao.getTurma().getNome(),
                avaliacao.getNotaMaxima(),
                avaliacao.getConteudo(),
                avaliacao.getDataAplicacao(),
                avaliacao.getDataEntregaNotas(),
                null,
                null);
    }

    public ListagemAvaliacaoDto(Avaliacao avaliacao, long totalAlunos, long alunosCorrigidos) {
        this(
                avaliacao.getId(),
                avaliacao.getNome(),
                avaliacao.getDisciplina().getNome(),
                avaliacao.getTurma() == null ? null : avaliacao.getTurma().getNome(),
                avaliacao.getNotaMaxima(),
                avaliacao.getConteudo(),
                avaliacao.getDataAplicacao(),
                avaliacao.getDataEntregaNotas(),
                totalAlunos,
                alunosCorrigidos);
    }
}
