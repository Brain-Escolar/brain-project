package br.com.brain.autenticacao;

/** Por que um login está desligado (docs/permissoes.md, D47). */
public enum MotivoDesativacao {
    /**
     * A pessoa ficou sem papel nenhum: desmatrícula, desligamento do professor
     * ou do secretário. O login volta sozinho quando ela recebe um perfil de
     * novo, e a tela de Usuários não o reativa.
     */
    SEM_PERFIL,
    /** Pela tela de Usuários. Só a tela desfaz; uma rematrícula não. */
    ADMINISTRATIVA,
}
