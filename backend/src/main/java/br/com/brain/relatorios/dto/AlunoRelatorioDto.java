package br.com.brain.relatorios.dto;

/** Identificação do aluno no cabeçalho dos relatórios. */
public record AlunoRelatorioDto(
        Long id,
        String nome,
        String serie,
        String turma,
        String unidade) {
}
