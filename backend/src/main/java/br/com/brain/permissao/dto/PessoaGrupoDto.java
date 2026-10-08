package br.com.brain.permissao.dto;

/**
 * Pessoa listada na aba de membros de um grupo ou entre os candidatos.
 *
 * email é o login (dados_autenticacao), nulo para quem não tem acesso ao
 * sistema. O nome social, quando preenchido, vale sobre o nome civil, como no
 * resto do sistema.
 */
public record PessoaGrupoDto(Long dadosPessoaisId, String nome, String email) {

    /** Usado pelas consultas JPQL do GrupoUsuarioMembroRepository. */
    public PessoaGrupoDto(Long dadosPessoaisId, String nome, String nomeSocial, String email) {
        this(dadosPessoaisId, nomeSocial != null && !nomeSocial.isBlank() ? nomeSocial : nome, email);
    }
}
