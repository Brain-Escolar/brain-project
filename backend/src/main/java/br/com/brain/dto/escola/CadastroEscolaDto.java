package br.com.brain.dto.escola;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CadastroEscolaDto(
        @NotBlank String nome,
        @NotBlank String cnpj,

        // Identificador público da escola (ex: "colegio-abc"), usado no login.
        // Apenas letras minúsculas, números e hífens.
        @NotBlank
        @Size(min = 3, max = 40)
        @Pattern(regexp = "^[a-z0-9-]+$", message = "O código deve conter apenas letras minúsculas, números e hífens.")
        String codigo
) {}
