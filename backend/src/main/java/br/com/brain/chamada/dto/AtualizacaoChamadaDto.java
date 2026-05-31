package br.com.brain.chamada.dto;

import java.time.LocalDate;

public record AtualizacaoChamadaDto(
        Long aulaId,
        Long alunoId,
        LocalDate data,
        Boolean presente) {
}
