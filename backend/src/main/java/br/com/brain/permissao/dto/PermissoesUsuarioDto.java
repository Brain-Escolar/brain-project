package br.com.brain.permissao.dto;

import br.com.brain.enums.PerfilNome;

import java.util.Map;

/**
 * Resposta de GET /permissoes/me. As permissões vêm separadas por perfil: o
 * frontend usa as do perfil ativo.
 */
public record PermissoesUsuarioDto(boolean gerenciaPermissoes, Map<PerfilNome, PermissoesPerfilDto> perfis) {
}
