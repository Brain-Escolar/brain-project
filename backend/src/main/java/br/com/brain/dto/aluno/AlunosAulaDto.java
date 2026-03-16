package br.com.brain.dto.aluno;

import java.util.List;

import br.com.brain.domain.aluno.Aluno;
import br.com.brain.domain.anotacao.Anotacao;

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
