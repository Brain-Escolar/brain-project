package br.com.brain.aluno.dto;

import br.com.brain.aluno.Aluno;

public record NomeAlunoDto(
        Long id,
        String nome) {

    public NomeAlunoDto(Aluno aluno) {
        this(
                aluno.getId(),
                aluno.getDadosPessoais().getNome());
    }
}
