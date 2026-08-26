package br.com.brain.produto.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CadastroProdutoModalidadeDto(
        @NotBlank String modalidade,
        @NotNull BigDecimal valor) {
}
