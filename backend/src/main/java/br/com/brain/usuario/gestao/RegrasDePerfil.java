package br.com.brain.usuario.gestao;

import br.com.brain.enums.PerfilNome;

import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

/**
 * Regras de conceder e remover perfil na tela de Usuários (docs/permissoes.md,
 * D50). O controle, a trava do próprio (RU1) e o alcance (RU2) são conferidos
 * antes, como nas ações de login; aqui fica o que é próprio do perfil.
 */
final class RegrasDePerfil {

    /** A ordem das linhas da seção Perfis: os concedíveis primeiro. */
    private static final List<PerfilNome> ORDEM = List.of(PerfilNome.ADMIN, PerfilNome.DIRETOR,
            PerfilNome.ORIENTADOR, PerfilNome.SECRETARIO);

    private RegrasDePerfil() {
    }

    /**
     * Perfis que aparecem na seção: os de função, o ADMIN quando quem vê é
     * ADMIN ou a pessoa já o tem, e os outros perfis dela, sem ação (RU6).
     */
    static List<PerfilNome> linhas(Set<PerfilNome> ator, Set<PerfilNome> alvo) {
        var linhas = new ArrayList<PerfilNome>();
        for (var perfil : ORDEM) {
            if (perfil != PerfilNome.ADMIN || ator.contains(PerfilNome.ADMIN) || alvo.contains(PerfilNome.ADMIN)) {
                linhas.add(perfil);
            }
        }
        alvo.stream().filter(perfil -> !linhas.contains(perfil)).sorted().forEach(linhas::add);
        return linhas;
    }

    /**
     * Por que quem age não mexe neste perfil, independente da pessoa. Nulo
     * quando pode. ADMIN e DIRETOR, só um ADMIN concede ou remove (U13).
     */
    static String motivoSemPermissao(Set<PerfilNome> ator, PerfilNome perfil) {
        if (perfil != PerfilNome.ADMIN && !AlcanceGestaoUsuarios.PERFIS_DE_FUNCAO.contains(perfil)) {
            return "Este perfil vem do cadastro de origem (aluno, responsável, professor) e muda por lá.";
        }
        if (!AlcanceGestaoUsuarios.perfisConcediveis(ator).contains(perfil)) {
            return "Só um administrador concede ou remove este perfil.";
        }
        return null;
    }

    /** Por que o perfil não pode ser concedido a esta pessoa. Nulo quando pode. */
    static String motivoNaoConcede(Set<PerfilNome> alvo, PerfilNome perfil) {
        if (alvo.contains(perfil)) {
            return "A pessoa já tem este perfil.";
        }
        if (alvo.isEmpty()) {
            return "A pessoa está sem nenhum perfil, e o login foi desligado. Ela volta pelo cadastro de origem.";
        }
        // RU6: perfil de funcionário não é concedido a quem só é aluno.
        if (alvo.equals(EnumSet.of(PerfilNome.ESTUDANTE))) {
            return "Perfil de funcionário não é concedido a quem só tem o perfil de aluno.";
        }
        return null;
    }

    /** Por que o perfil não pode ser removido desta pessoa. Nulo quando pode. */
    static String motivoNaoRemove(Set<PerfilNome> alvo, PerfilNome perfil) {
        if (!alvo.contains(perfil)) {
            return "A pessoa não tem este perfil.";
        }
        // RU5: não fica sem perfil por aqui. Para tirar todo o acesso, desativa-se o login.
        if (alvo.size() == 1) {
            return "É o único perfil da pessoa. Para tirar todo o acesso, desative o login.";
        }
        return null;
    }
}
