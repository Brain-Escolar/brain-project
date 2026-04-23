package br.com.brain.aluno.dtos;

import br.com.brain.aluno.domain.Aluno;
import br.com.brain.shared.endereco.Endereco;

import java.time.LocalDate;

public record DetalhamentoAlunoDto(
        Long id,
        String cpf,
        String rg,
        String matricula,
        String nome,
        String nomeSocial,
        LocalDate dataDeNascimento,
        String cidadeNaturalidade,
        String email,
        Endereco endereco,
        Boolean matriculado) {

    public DetalhamentoAlunoDto(Aluno aluno) {
        this(
                aluno.getId(),
                aluno.getDadosPessoais().getCpf(),
                aluno.getDadosPessoais().getRg(),
                aluno.getDadosPessoais().getMatricula(),
                aluno.getDadosPessoais().getNome(),
                aluno.getDadosPessoais().getNomeSocial(),
                aluno.getDadosPessoais().getDataDeNascimento(),
                aluno.getDadosPessoais().getCidadeNaturalidade(),
                aluno.getDadosPessoais().getEmail(),
                aluno.getDadosPessoais().getEndereco(),
                aluno.getMatriculado());
    }
}
