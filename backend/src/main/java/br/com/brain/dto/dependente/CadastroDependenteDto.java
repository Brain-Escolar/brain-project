package br.com.brain.dto.dependente;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDate;

import br.com.brain.enums.GrauParentesco;

public record CadastroDependenteDto(
        @NotBlank String nome,
        @NotBlank @Pattern(regexp = "\\d{11}") String cpf,
        @NotNull LocalDate dataDeNascimento,
        GrauParentesco grauParentesco,
        Boolean possuiDeficiencia) {
}
