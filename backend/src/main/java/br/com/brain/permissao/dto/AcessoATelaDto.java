package br.com.brain.permissao.dto;

import br.com.brain.enums.PerfilNome;

/**
 * Grupo ou acesso individual que libera uma tela (aba "Por tela" de
 * /grupos-usuarios). Com individual=true, nome é o da pessoa, e não do grupo.
 */
public record AcessoATelaDto(
        Long grupoId,
        String nome,
        PerfilNome perfil,
        boolean individual,
        boolean ativo,
        long quantidadeMembros) {
}
