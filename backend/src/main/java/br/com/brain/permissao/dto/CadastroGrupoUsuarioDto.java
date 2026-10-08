package br.com.brain.permissao.dto;

import br.com.brain.enums.PerfilNome;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CadastroGrupoUsuarioDto(
        @NotNull PerfilNome perfil,
        @NotBlank @Size(max = 100) String nome,
        @Size(max = 255) String descricao) {
}
