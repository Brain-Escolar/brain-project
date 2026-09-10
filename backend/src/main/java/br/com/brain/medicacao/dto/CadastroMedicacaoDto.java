package br.com.brain.medicacao.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Inclusao de medicacao em uso, feita pelo responsavel no portal.
 *
 * Só o nome e obrigatorio: a familia nem sempre sabe a dosagem exata na hora
 * do cadastro, e exigir o campo levaria a dado inventado numa ficha de saude.
 */
public record CadastroMedicacaoDto(
        @NotBlank @Size(max = 255) String nome,
        @Size(max = 255) String dosagem,
        @Size(max = 255) String horario,
        @Size(max = 500) String observacao) {
}
