package br.com.brain.dto.avaliacao;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CadastroAvaliacaoDto(
        @NotBlank String nome,
        @NotNull Long disciplinaId,
        @NotNull BigDecimal peso,
        String conteudo,
        Boolean notaExtra) {
}
