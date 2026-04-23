package br.com.brain.notas.dtos;

import br.com.brain.notas.domain.Notas;

import java.math.BigDecimal;
import java.time.LocalDate;

public record NotaDisciplinaItemDto(
        String nomeAvaliacao,
        LocalDate dataAplicacao,
        BigDecimal pontuacao) {

    public NotaDisciplinaItemDto(Notas notas) {
        this(
                notas.getAvaliacao().getNome(),
                notas.getAvaliacao().getDataAplicacao(),
                notas.getPontuacao());
    }
}
