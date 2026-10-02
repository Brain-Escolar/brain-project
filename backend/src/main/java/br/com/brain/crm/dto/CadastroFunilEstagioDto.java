package br.com.brain.crm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CadastroFunilEstagioDto(
        @NotBlank String nome,
        @NotNull Integer ordem,
        Integer slaDias) {
}
