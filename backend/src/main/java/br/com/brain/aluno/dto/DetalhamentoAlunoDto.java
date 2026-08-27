package br.com.brain.aluno.dto;

import br.com.brain.aluno.Aluno;
import br.com.brain.aluno.AlunoViews;
import br.com.brain.endereco.Endereco;
import com.fasterxml.jackson.annotation.JsonView;

import java.time.LocalDate;
import java.util.List;

public record DetalhamentoAlunoDto(
        @JsonView(AlunoViews.Publico.class) Long id,
        @JsonView(AlunoViews.Administrativo.class) String cpf,
        @JsonView(AlunoViews.Administrativo.class) String rg,
        @JsonView(AlunoViews.Publico.class) String matricula,
        @JsonView(AlunoViews.Publico.class) String nome,
        @JsonView(AlunoViews.Publico.class) String nomeSocial,
        @JsonView(AlunoViews.Administrativo.class) LocalDate dataDeNascimento,
        @JsonView(AlunoViews.Administrativo.class) String cidadeNaturalidade,
        @JsonView(AlunoViews.Administrativo.class) String email,
        @JsonView(AlunoViews.Administrativo.class) String emailEscolar,
        @JsonView(AlunoViews.Administrativo.class) Endereco endereco,
        @JsonView(AlunoViews.Publico.class) Boolean matriculado,
        @JsonView(AlunoViews.Publico.class) String cursoPretendido,
        @JsonView(AlunoViews.Publico.class) String serieNome,
        @JsonView(AlunoViews.Publico.class) String turmaNome,
        @JsonView(AlunoViews.Publico.class) Long serieId,
        @JsonView(AlunoViews.Publico.class) Long unidadeId,
        @JsonView(AlunoViews.Publico.class) Long turmaId,
        @JsonView(AlunoViews.Administrativo.class) String motivoDesmatricula,
        @JsonView(AlunoViews.Administrativo.class) LocalDate dataDesmatricula,
        @JsonView(AlunoViews.Administrativo.class) List<ResponsavelResumoDto> responsaveis) {

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
                aluno.getDadosPessoais().getEmailProfissional(),
                aluno.getDadosPessoais().getEndereco(),
                aluno.getMatriculado(),
                aluno.getCursoPretendido() != null ? aluno.getCursoPretendido().getDescricao() : null,
                aluno.getSerie() != null ? aluno.getSerie().getNome() : null,
                aluno.getTurma() != null ? aluno.getTurma().getNome() : null,
                aluno.getSerie() != null ? aluno.getSerie().getId() : null,
                aluno.getUnidade() != null ? aluno.getUnidade().getId() : null,
                aluno.getTurma() != null ? aluno.getTurma().getId() : null,
                aluno.getMotivoDesmatricula(),
                aluno.getDataDesmatricula(),
                aluno.getResponsaveis().stream().map(ResponsavelResumoDto::new).toList());
    }
}
