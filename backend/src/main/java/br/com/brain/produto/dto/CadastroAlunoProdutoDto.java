package br.com.brain.produto.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;

public record CadastroAlunoProdutoDto(
        @NotNull Long alunoId,
        BigDecimal desconto,
        LocalDate dataCompra) {
}
