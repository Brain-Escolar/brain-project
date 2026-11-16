package br.com.brain.usuario.gestao;

import br.com.brain.enums.PerfilNome;

import java.util.Collection;
import java.util.EnumSet;
import java.util.Set;

/**
 * Sobre quem cada um age na tela de Usuários e quais perfis concede
 * (docs/permissoes.md, D46, RU2). Fica separado dos controles: o controle diz
 * o que a pessoa faz; o alcance, com quem.
 *
 * - ADMIN age sobre todos e concede os perfis de função e o ADMIN.
 * - DIRETOR age sobre todos menos quem tem ADMIN, e concede ORIENTADOR e
 *   SECRETARIO.
 * - Qualquer outro perfil, com o controle, age só sobre quem não tem ADMIN nem
 *   DIRETOR, e não concede ADMIN nem DIRETOR. A secretaria entra aqui.
 *
 * Para dar a outro perfil um alcance diferente (o RH só sobre funcionários,
 * por exemplo), muda-se só esta classe (seção 7.1 da proposta).
 */
public final class AlcanceGestaoUsuarios {

    /** Perfis que a tela de Usuários concede e remove (U7). Os outros ficam nos cadastros de origem. */
    public static final Set<PerfilNome> PERFIS_DE_FUNCAO = EnumSet.of(PerfilNome.DIRETOR, PerfilNome.ORIENTADOR,
            PerfilNome.SECRETARIO);

    private AlcanceGestaoUsuarios() {
    }

    /** Perfis que passam pela gestão sem precisar do controle (U12). */
    public static boolean ehGestor(Collection<PerfilNome> ator) {
        return ator.contains(PerfilNome.ADMIN) || ator.contains(PerfilNome.DIRETOR);
    }

    public static boolean podeAgirSobre(Collection<PerfilNome> ator, Collection<PerfilNome> alvo) {
        if (ator.contains(PerfilNome.ADMIN)) {
            return true;
        }
        if (alvo.contains(PerfilNome.ADMIN)) {
            return false;
        }
        return ator.contains(PerfilNome.DIRETOR) || !alvo.contains(PerfilNome.DIRETOR);
    }

    /** Por que o ator não age sobre o alvo, para a tela explicar. Nulo quando pode. */
    public static String motivoForaDoAlcance(Collection<PerfilNome> ator, Collection<PerfilNome> alvo) {
        if (podeAgirSobre(ator, alvo)) {
            return null;
        }
        return alvo.contains(PerfilNome.ADMIN)
                ? "Só um administrador altera o acesso de outro administrador."
                : "Só a direção ou um administrador altera o acesso de quem é da direção.";
    }

    public static Set<PerfilNome> perfisConcediveis(Collection<PerfilNome> ator) {
        if (ator.contains(PerfilNome.ADMIN)) {
            var todos = EnumSet.copyOf(PERFIS_DE_FUNCAO);
            todos.add(PerfilNome.ADMIN);
            return todos;
        }
        return EnumSet.of(PerfilNome.ORIENTADOR, PerfilNome.SECRETARIO);
    }
}
