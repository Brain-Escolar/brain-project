package br.com.brain.crm.dto;

import jakarta.validation.constraints.NotBlank;

public record MarcarPerdidoDto(@NotBlank String motivo) {
}
