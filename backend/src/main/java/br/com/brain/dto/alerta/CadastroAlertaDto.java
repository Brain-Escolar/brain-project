package br.com.brain.dto.alerta;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CadastroAlertaDto(
        @NotBlank String titulo, @NotBlank String conteudo, @NotNull LocalDate data) {
}
