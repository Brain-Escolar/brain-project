package br.com.brain.usuario.dto;

import jakarta.validation.constraints.NotBlank;

/** A escola vem do seletor da tela de login: sem ela não há onde procurar o login (F5). */
public record EsqueciSenhaDto(@NotBlank String email, @NotBlank String codigoEscola) {
}
