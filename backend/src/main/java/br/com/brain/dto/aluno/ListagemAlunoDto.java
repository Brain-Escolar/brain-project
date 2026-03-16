package br.com.brain.dto.aluno;

import br.com.brain.domain.aluno.Aluno;
import br.com.brain.domain.endereco.Endereco;

public record ListagemAlunoDto(
        Long id,
        String cpf,
        String rg,
        String matricula,
        String nome,
        String unidade,
        String serie,
        String turma,
        String nomeSocial,
        String email,
        String emailEscolar,
        Endereco endereco,
        Boolean matriculado) {

    public ListagemAlunoDto(Aluno aluno) {
        this(
                aluno.getId(),
                aluno.getDadosPessoais().getCpf(),
                aluno.getDadosPessoais().getRg(),
                aluno.getDadosPessoais().getMatricula(),
                aluno.getDadosPessoais().getNome(),
                aluno.getUnidade() == null ? "Sem unidade" : aluno.getUnidade().getNome(),
                aluno.getSerie() == null ? "Sem serie" : aluno.getSerie().getNome(),
                aluno.getTurma() == null ? "Sem turma" : aluno.getTurma().getNome(),
                aluno.getDadosPessoais().getNomeSocial(),
                aluno.getDadosPessoais().getEmail(),
                aluno.getDadosPessoais().getEmailProfissional(),
                aluno.getDadosPessoais().getEndereco(),
                aluno.getMatriculado());
    }
}
