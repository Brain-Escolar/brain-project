package br.com.brain.dto.notas;

import java.math.BigDecimal;
import br.com.brain.domain.notas.Notas;

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
