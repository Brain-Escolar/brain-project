package br.com.brain.usuario.gestao.dto;

import br.com.brain.enums.PerfilNome;

/** Grupo normal de que a pessoa é membro. Inativo aparece marcado: não dá acesso. */
public record GrupoDoUsuarioDto(Long id, String nome, PerfilNome perfil, boolean ativo, boolean padrao) {
}
