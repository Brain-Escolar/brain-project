package br.com.brain.dto.anotacao;

import java.time.LocalDate;

import br.com.brain.enums.Anotacoes;

public record AtualizacaoAnotacaoDto(
        Long alunoId,
        Long aulaId,
        Anotacoes tipoAnotacao,
        LocalDate data,
        String observacao) {
}
