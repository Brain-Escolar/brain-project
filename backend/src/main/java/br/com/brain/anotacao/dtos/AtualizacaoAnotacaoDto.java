package br.com.brain.anotacao.dtos;

import java.time.LocalDate;

import br.com.brain.shared.enums.Anotacoes;

public record AtualizacaoAnotacaoDto(
        Long alunoId,
        Long aulaId,
        Anotacoes tipoAnotacao,
        LocalDate data,
        String observacao) {
}
