package br.com.brain.notas.dtos;

import java.math.BigDecimal;
import br.com.brain.notas.domain.Notas;

public record ListagemNotasDto(
        String aluno,
        String disciplina,
        String avaliacao,
        BigDecimal pontuacao) {

    public ListagemNotasDto(Notas notas) {
        this(
                notas.getAluno().getDadosPessoais().getNome(),
                notas.getAvaliacao().getDisciplina().getNome(),
                notas.getAvaliacao().getNome(),
                notas.getPontuacao());
    }
}
