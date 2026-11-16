package br.com.brain.permissao.dto;

/**
 * Pessoa na aba de membros de um grupo. acessosIndividuais conta as telas e os
 * controles que ela tem só pelo acesso individual, no perfil do grupo: o que um
 * grupo ativo dela também dá fica de fora.
 *
 * semOPerfil marca quem continua no grupo depois de perder o perfil: o vínculo
 * fica guardado e não dá nada até o perfil voltar (RU4).
 */
public record MembroGrupoDto(Long dadosPessoaisId, String nome, String email, long acessosIndividuais,
        boolean semOPerfil) {

    public MembroGrupoDto(PessoaGrupoDto pessoa, long acessosIndividuais, boolean semOPerfil) {
        this(pessoa.dadosPessoaisId(), pessoa.nome(), pessoa.email(), acessosIndividuais, semOPerfil);
    }
}
