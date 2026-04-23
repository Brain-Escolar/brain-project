package br.com.brain.aluno.dtos;

import java.util.List;

import br.com.brain.aluno.domain.Aluno;
import br.com.brain.anotacao.domain.Anotacao;

public record AlunosAulaDto(
        Long id,
        String nome,
        Integer registros,
        Integer faltas) {

    public AlunosAulaDto(Aluno aluno, List<Anotacao> anotacoes, Integer falta) {
        this(
                aluno.getId(),
                aluno.getDadosPessoais().getNome(),
                anotacoes.size(),
                falta);
    }
}
