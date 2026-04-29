package br.com.brain.dto.gradeCurricular;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record CadastroGradeCurricularDto(
        @NotBlank String nome,
        @NotBlank String versao,
        Boolean ativo,
        List<Long> disciplinaIds) {
}
