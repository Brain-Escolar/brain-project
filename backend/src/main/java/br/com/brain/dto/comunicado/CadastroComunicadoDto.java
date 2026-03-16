package br.com.brain.dto.comunicado;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CadastroComunicadoDto(
        @NotBlank String titulo, @NotBlank String conteudo, @NotNull LocalDate data) {
}
