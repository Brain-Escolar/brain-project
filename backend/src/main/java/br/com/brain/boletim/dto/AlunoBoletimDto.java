package br.com.brain.boletim.dto;

/** Identificação do aluno no cabeçalho do boletim. */
public record AlunoBoletimDto(
        Long id,
        String nome,
        String serie,
        String turma,
        String unidade) {
}
