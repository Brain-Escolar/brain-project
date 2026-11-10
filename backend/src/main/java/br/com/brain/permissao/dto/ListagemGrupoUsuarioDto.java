package br.com.brain.permissao.dto;

import br.com.brain.enums.PerfilNome;

public record ListagemGrupoUsuarioDto(
        Long id,
        String nome,
        String descricao,
        PerfilNome perfil,
        boolean padrao,
        boolean ativo,
        long quantidadeMembros,
        long quantidadeTelas,
        long quantidadeControles) {
}
