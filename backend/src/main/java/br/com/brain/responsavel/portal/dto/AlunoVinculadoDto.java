package br.com.brain.responsavel.portal.dto;

import br.com.brain.aluno.Aluno;

/**
 * Aluno vinculado ao responsavel logado - item do seletor no AppBar.
 *
 * "Vinculado", nao "filho": o vinculo responsavel-aluno admite avo, irmao,
 * tutor e OUTRO (ver GrauParentesco), entao nomear por parentesco seria
 * errado para parte dos casos.
 *
 * Enxuto de proposito: alimenta o dropdown, nao a tela de detalhe.
 */
public record AlunoVinculadoDto(
        Long id,
        String nome,
        String nomeSocial,
        String matricula,
        String serie,
        String turma,
        String unidade,
        Long serieId,
        Long turmaId,
        Long unidadeId,
        Boolean matriculado) {

    public AlunoVinculadoDto(Aluno aluno) {
        this(
                aluno.getId(),
                aluno.getDadosPessoais() == null ? null : aluno.getDadosPessoais().getNome(),
                aluno.getDadosPessoais() == null ? null : aluno.getDadosPessoais().getNomeSocial(),
                aluno.getDadosPessoais() == null ? null : aluno.getDadosPessoais().getMatricula(),
                aluno.getSerie() == null ? null : aluno.getSerie().getNome(),
                aluno.getTurma() == null ? null : aluno.getTurma().getNome(),
                aluno.getUnidade() == null ? null : aluno.getUnidade().getNome(),
                aluno.getSerie() == null ? null : aluno.getSerie().getId(),
                aluno.getTurma() == null ? null : aluno.getTurma().getId(),
                aluno.getUnidade() == null ? null : aluno.getUnidade().getId(),
                aluno.getMatriculado());
    }
}
