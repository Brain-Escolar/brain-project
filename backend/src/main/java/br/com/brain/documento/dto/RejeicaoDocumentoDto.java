package br.com.brain.documento.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** O motivo e exibido para a familia no portal - precisa dizer o que corrigir. */
public record RejeicaoDocumentoDto(
        @NotBlank @Size(max = 1000) String motivo) {
}
