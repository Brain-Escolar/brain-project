package br.com.brain.usuario.gestao.dto;

import br.com.brain.enums.PerfilNome;

/** Opção do filtro por grupo da lista de Usuários. */
public record GrupoFiltroDto(Long id, String nome, PerfilNome perfil, boolean ativo) {
}
