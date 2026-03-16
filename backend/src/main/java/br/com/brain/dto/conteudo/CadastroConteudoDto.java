package br.com.brain.dto.conteudo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record CadastroConteudoDto(
        @NotBlank String conteudo,
        @NotNull Long aulaId,
        @NotNull LocalDate data) {
}
