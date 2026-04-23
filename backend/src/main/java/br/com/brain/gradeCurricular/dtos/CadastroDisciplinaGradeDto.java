package br.com.brain.gradeCurricular.dtos;

import java.util.List;

import jakarta.validation.constraints.NotBlank;

public record CadastroDisciplinaGradeDto(
        @NotBlank Long gradeCurricularId,
        @NotBlank List<Long> disciplinasId,
        int cargaHoraria,
        boolean obrigatoria) {
}
