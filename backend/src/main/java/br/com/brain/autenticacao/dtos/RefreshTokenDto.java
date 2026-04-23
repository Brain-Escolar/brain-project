package br.com.brain.autenticacao.dtos;

import jakarta.validation.constraints.NotBlank;

public record RefreshTokenDto(@NotBlank String refreshToken) {
}
