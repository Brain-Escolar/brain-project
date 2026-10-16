package br.com.brain.permissao;

import java.util.Set;

/**
 * Controles que mostram dado sensível da família ou do aluno (docs/permissoes.md,
 * D23). Hoje só a orientação os tem no teto; no acesso individual podem ser
 * dados a qualquer pessoa, e a tela de grupos marca a linha com um aviso.
 *
 * Fica no código, como as dependências: é uma propriedade do que o controle
 * mostra, e muda junto com a tela.
 */
public final class ControlesSensiveis {

    private static final Set<String> CODIGOS = Set.of(
            "SITUACAO_FAMILIAR.VER",
            "SITUACAO_FAMILIAR.EDITAR",
            "ATENDIMENTO_PSICOLOGICO.VER",
            "ATENDIMENTO_PSICOLOGICO.REGISTRAR");

    private ControlesSensiveis() {
    }

    public static boolean contem(String codigo) {
        return CODIGOS.contains(codigo);
    }

    public static Set<String> todos() {
        return CODIGOS;
    }
}
