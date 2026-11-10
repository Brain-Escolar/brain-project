package br.com.brain.permissao.dto;

import br.com.brain.enums.PerfilNome;

import java.util.List;

/** Grupo com os códigos concedidos: a tela de grupos cruza com o catálogo do perfil. */
public record DetalhamentoGrupoUsuarioDto(
        Long id,
        String nome,
        String descricao,
        PerfilNome perfil,
        boolean padrao,
        boolean ativo,
        long quantidadeMembros,
        List<String> telas,
        List<String> controles) {
}
