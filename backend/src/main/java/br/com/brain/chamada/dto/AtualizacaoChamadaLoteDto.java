package br.com.brain.chamada.dto;

import java.util.List;

import jakarta.validation.constraints.NotNull;

public record AtualizacaoChamadaLoteDto(@NotNull List<PresencaAlunoDto> presencas) {
}
