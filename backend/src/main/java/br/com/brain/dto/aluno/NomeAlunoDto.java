package br.com.brain.dto.aluno;

import br.com.brain.domain.aluno.Aluno;

public record NomeAlunoDto(
        Long id,
        String nome) {

    public NomeAlunoDto(Aluno aluno) {
        this(
                aluno.getId(),
                aluno.getDadosPessoais().getNome());
    }
}
