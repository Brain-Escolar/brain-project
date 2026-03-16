package br.com.brain.dto.chamada;

import java.time.LocalDate;

public record AtualizacaoChamadaDto(
        Long aulaId,
        Long alunoId,
        LocalDate data,
        Boolean presente) {
}
