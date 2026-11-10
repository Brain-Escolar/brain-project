package br.com.brain.permissao.dto;

/**
 * Pessoa na aba de membros de um grupo. acessosIndividuais conta as telas e os
 * controles que ela tem só pelo acesso individual, no perfil do grupo: o que um
 * grupo ativo dela também dá fica de fora.
 */
public record MembroGrupoDto(Long dadosPessoaisId, String nome, String email, long acessosIndividuais) {

    public MembroGrupoDto(PessoaGrupoDto pessoa, long acessosIndividuais) {
        this(pessoa.dadosPessoaisId(), pessoa.nome(), pessoa.email(), acessosIndividuais);
    }
}
