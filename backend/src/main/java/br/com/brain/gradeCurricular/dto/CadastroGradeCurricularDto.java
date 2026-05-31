package br.com.brain.gradeCurricular.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record CadastroGradeCurricularDto(
        @NotBlank String nome,
        @NotBlank String versao,
        Boolean ativo,
        List<Long> disciplinaIds) {
}
