package br.com.brain.produto.dto;

import jakarta.validation.constraints.NotBlank;

public record CadastroProdutoDto(
        @NotBlank String nome,
        String descricao) {
}
