package br.com.brain.permissao.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DuplicacaoGrupoUsuarioDto(@NotBlank @Size(max = 100) String nome) {
}
