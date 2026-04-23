package br.com.brain.chamada.dtos;

import java.time.LocalDate;

public record AtualizacaoChamadaDto(
        Long aulaId,
        Long alunoId,
        LocalDate data,
        Boolean presente) {
}
