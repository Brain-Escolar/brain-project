package br.com.brain.notas.dto;

import br.com.brain.notas.Notas;

import java.math.BigDecimal;
import java.time.LocalDate;

public record NotaDisciplinaItemDto(
        String nomeAvaliacao,
        LocalDate dataAplicacao,
        BigDecimal pontuacao) {

    public NotaDisciplinaItemDto(Notas notas) {
        this(
                notas.getAvaliacaoTurma().getAvaliacao().getNome(),
                notas.getAvaliacaoTurma().getDataAplicacao(),
                notas.getPontuacao());
    }
}
