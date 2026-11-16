package br.com.brain.usuario.gestao.dto;

/**
 * De onde vem um item do acesso efetivo: um grupo (nome é o do grupo), o
 * acesso individual da pessoa ou o teto do ADMIN, que não passa por grupo.
 */
public record OrigemAcessoDto(Tipo tipo, String nome) {

    public enum Tipo {
        GRUPO, INDIVIDUAL, TETO_ADMIN
    }

    public static final OrigemAcessoDto INDIVIDUAL = new OrigemAcessoDto(Tipo.INDIVIDUAL, "Acesso individual");
    public static final OrigemAcessoDto TETO_ADMIN = new OrigemAcessoDto(Tipo.TETO_ADMIN, "Teto do administrador");

    public static OrigemAcessoDto grupo(String nome) {
        return new OrigemAcessoDto(Tipo.GRUPO, nome);
    }
}
