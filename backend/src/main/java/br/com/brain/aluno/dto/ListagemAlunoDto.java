package br.com.brain.aluno.dto;

import br.com.brain.aluno.Aluno;
import br.com.brain.endereco.Endereco;

import java.time.Instant;
import java.time.LocalDate;

public record ListagemAlunoDto(
        Long id,
        String cpf,
        String rg,
        String matricula,
        String nome,
        String unidade,
        String serie,
        String turma,
        Long unidadeId,
        Long serieId,
        Long turmaId,
        String nomeSocial,
        String email,
        String emailEscolar,
        Endereco endereco,
        Boolean matriculado,
        String motivoDesmatricula,
        LocalDate dataDesmatricula,
        Instant criadoEm) {

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
                aluno.getUnidade() == null ? null : aluno.getUnidade().getId(),
                aluno.getSerie() == null ? null : aluno.getSerie().getId(),
                aluno.getTurma() == null ? null : aluno.getTurma().getId(),
                aluno.getDadosPessoais().getNomeSocial(),
                aluno.getDadosPessoais().getEmail(),
                aluno.getDadosPessoais().getEmailProfissional(),
                aluno.getDadosPessoais().getEndereco(),
                aluno.getMatriculado(),
                aluno.getMotivoDesmatricula(),
                aluno.getDataDesmatricula(),
                aluno.getCriadoEm());
    }
}
