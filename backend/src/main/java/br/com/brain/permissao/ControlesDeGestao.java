package br.com.brain.permissao;

import java.util.Set;

/**
 * A tela de Usuários e os controles de gestão de acesso (docs/permissoes.md,
 * D44). Ficam no código, como os sensíveis, porque são propriedade do que o
 * item permite: dar acesso a outras pessoas.
 *
 * O acesso individual não concede estes itens fora do teto do perfil (U14).
 * Sem isso, qualquer pessoa poderia receber a gestão de acessos por um grupo de
 * uma pessoa só, e quem gerencia poderia criar outro gestor fora das regras.
 * Assim, só um grupo de um perfil que está no teto recebe gestão.
 */
public final class ControlesDeGestao {

    public static final String TELA = "USUARIOS";
    public static final String LOGIN_GERENCIAR = "USUARIO.LOGIN.GERENCIAR";
    public static final String ACESSOS_VER = "USUARIO.ACESSOS.VER";
    public static final String GRUPOS_GERENCIAR = "USUARIO.GRUPOS.GERENCIAR";
    public static final String PERFIS_GERENCIAR = "USUARIO.PERFIS.GERENCIAR";
    public static final String ACESSOS_INDIVIDUAIS_GERENCIAR = "USUARIO.ACESSOS_INDIVIDUAIS.GERENCIAR";

    private static final Set<String> CODIGOS = Set.of(TELA, LOGIN_GERENCIAR, ACESSOS_VER, GRUPOS_GERENCIAR,
            PERFIS_GERENCIAR, ACESSOS_INDIVIDUAIS_GERENCIAR);

    private ControlesDeGestao() {
    }

    public static boolean contem(String codigo) {
        return CODIGOS.contains(codigo);
    }

    public static Set<String> todos() {
        return CODIGOS;
    }
}
