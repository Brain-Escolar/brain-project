package br.com.brain.dto.aluno;

import br.com.brain.domain.aluno.Aluno;
import br.com.brain.domain.endereco.Endereco;

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
