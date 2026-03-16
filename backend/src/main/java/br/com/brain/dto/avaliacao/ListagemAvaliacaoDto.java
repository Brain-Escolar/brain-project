package br.com.brain.dto.avaliacao;

import java.math.BigDecimal;

import br.com.brain.domain.avaliacao.Avaliacao;

public record ListagemAvaliacaoDto(
        Long id,
        String nome,
        String disciplina,
        BigDecimal peso,
        String conteudo) {

    public ListagemAvaliacaoDto(Avaliacao avaliacao) {
        this(
                avaliacao.getId(),
                avaliacao.getNome(),
                avaliacao.getDisciplina().getNome(),
                avaliacao.getPeso(),
                avaliacao.getConteudo());
    }
}
