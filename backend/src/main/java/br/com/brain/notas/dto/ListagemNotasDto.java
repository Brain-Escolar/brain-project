package br.com.brain.notas.dto;

import java.math.BigDecimal;
import br.com.brain.notas.Notas;

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
