package br.com.brain.materialComplementar.dto;

import br.com.brain.enums.TipoMaterial;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CadastroMaterialComplementarDto(
        @NotNull Long disciplinaId,
        @NotBlank String titulo,
        String descricao,
        @NotNull TipoMaterial tipo,
        String url) {
}
