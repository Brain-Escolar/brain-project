package br.com.brain.permissao;

import br.com.brain.enums.PerfilNome;

/**
 * Pessoa num grupo, para a tela de Usuários. individualDe é preenchido quando o
 * grupo é o acesso individual dela (D18).
 */
public record VinculoDeGrupo(Long dadosPessoaisId, Long grupoId, String nome, PerfilNome perfil, Boolean ativo,
        Boolean padrao, Long individualDe) {

    public boolean individual() {
        return individualDe != null;
    }
}
