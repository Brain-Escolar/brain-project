package br.com.brain.aluno.dto;

import java.util.List;

import br.com.brain.aluno.Aluno;
import br.com.brain.anotacao.Anotacao;

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
