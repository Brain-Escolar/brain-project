package br.com.brain.usuario.gestao.dto;

import java.util.List;

/**
 * Seção "Acesso efetivo" da página da pessoa (USUARIO.ACESSOS.VER). Um bloco
 * por perfil que ela tem. gruposGuardados são os grupos de perfis que ela não
 * tem mais: não dão nada, mas voltam se o perfil voltar (RU3, RU4).
 */
public record AcessoEfetivoDto(Long dadosPessoaisId, List<AcessoDoPerfilDto> perfis,
        List<GrupoDoUsuarioDto> gruposGuardados) {
}
