package br.com.brain.aluno.dtos;

import br.com.brain.aluno.domain.Aluno;

public record NomeAlunoDto(
        Long id,
        String nome) {

    public NomeAlunoDto(Aluno aluno) {
        this(
                aluno.getId(),
                aluno.getDadosPessoais().getNome());
    }
}
