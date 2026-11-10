package br.com.brain.permissao.dto;

import br.com.brain.enums.PerfilNome;

import java.util.Map;

/**
 * Resposta de GET /permissoes/me. As permissões vêm separadas por perfil: o
 * frontend usa as do perfil ativo. Em telas, os dados de cada tela que aparece
 * nas listas dos perfis, por código.
 */
public record PermissoesUsuarioDto(boolean gerenciaPermissoes, Map<PerfilNome, PermissoesPerfilDto> perfis,
        Map<String, TelaResumoDto> telas) {
}
