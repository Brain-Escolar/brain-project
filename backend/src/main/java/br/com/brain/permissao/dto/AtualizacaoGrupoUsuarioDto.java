package br.com.brain.permissao.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** O perfil fica de fora de propósito: ele não muda depois que o grupo é criado. */
public record AtualizacaoGrupoUsuarioDto(
        @NotBlank @Size(max = 100) String nome,
        @Size(max = 255) String descricao,
        @NotNull Boolean ativo) {
}
