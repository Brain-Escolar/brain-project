package br.com.brain.usuario.gestao;

import br.com.brain.autenticacao.DadosAutenticacao;
import br.com.brain.autenticacao.SituacaoLogin;
import br.com.brain.dadosPessoais.DadosPessoais;
import br.com.brain.enums.PerfilNome;
import br.com.brain.perfil.Perfil;
import br.com.brain.permissao.GrupoUsuario;
import br.com.brain.permissao.GrupoUsuarioMembro;
import br.com.brain.usuario.gestao.dto.FiltroUsuariosDto;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;

import java.util.ArrayList;
import java.util.Locale;

import org.springframework.data.jpa.domain.Specification;

/**
 * Filtros da lista de Usuários, montados só com o que veio preenchido. Em
 * Criteria, e não em JPQL com parâmetro opcional, porque "(:x is null or ...)"
 * quebra no PostgreSQL (ver GrupoUsuarioMembroRepository).
 */
final class FiltrosUsuarios {

    private FiltrosUsuarios() {
    }

    static Specification<DadosAutenticacao> de(FiltroUsuariosDto filtro) {
        return (login, query, cb) -> {
            Join<DadosAutenticacao, DadosPessoais> pessoa = login.join("dadosPessoais");
            var condicoes = new ArrayList<Predicate>();

            if (filtro.busca() != null && !filtro.busca().isBlank()) {
                var padrao = "%" + filtro.busca().trim().toLowerCase(Locale.ROOT) + "%";
                condicoes.add(cb.or(
                        cb.like(cb.lower(cb.coalesce(pessoa.get("nome"), "")), padrao),
                        cb.like(cb.lower(cb.coalesce(pessoa.get("nomeSocial"), "")), padrao),
                        cb.like(cb.lower(cb.coalesce(login.get("email"), "")), padrao)));
            }
            if (filtro.perfil() != null) {
                condicoes.add(cb.exists(comPerfil(query, cb, pessoa, filtro.perfil())));
            }
            if (filtro.grupoId() != null) {
                var membro = query.subquery(Long.class);
                Root<GrupoUsuarioMembro> m = membro.from(GrupoUsuarioMembro.class);
                membro.select(m.get("id")).where(
                        cb.equal(m.get("dadosPessoais"), pessoa),
                        cb.equal(m.get("grupoUsuario").get("id"), filtro.grupoId()));
                condicoes.add(cb.exists(membro));
            }
            if (filtro.situacao() != null) {
                condicoes.add(situacao(cb, login, filtro.situacao()));
            }
            if (Boolean.TRUE.equals(filtro.comAcessoIndividual())) {
                var individual = query.subquery(Long.class);
                Root<GrupoUsuarioMembro> m = individual.from(GrupoUsuarioMembro.class);
                individual.select(m.get("id")).where(
                        cb.equal(m.get("dadosPessoais"), pessoa),
                        cb.isNotNull(m.get("grupoUsuario").get("dadosPessoais")));
                condicoes.add(cb.exists(individual));
            }
            if (Boolean.TRUE.equals(filtro.semAcesso())) {
                condicoes.add(cb.exists(perfilSemAcesso(query, cb, pessoa)));
            }
            return cb.and(condicoes.toArray(Predicate[]::new));
        };
    }

    private static Subquery<Long> comPerfil(CriteriaQuery<?> query, CriteriaBuilder cb,
            Join<DadosAutenticacao, DadosPessoais> pessoa, PerfilNome perfil) {
        var sub = query.subquery(Long.class);
        Root<DadosPessoais> dp = sub.from(DadosPessoais.class);
        Join<DadosPessoais, Perfil> p = dp.join("perfis");
        sub.select(dp.get("id")).where(cb.equal(dp, pessoa), cb.equal(p.get("nome"), perfil));
        return sub;
    }

    /**
     * Algum perfil da pessoa, menos o ADMIN, sem grupo ativo nem acesso
     * individual: ela não abre nenhuma tela dele (D2). A consulta da seção 8.4
     * contava grupos inativos; aqui só o grupo ativo vale, como no cálculo (RP1).
     */
    private static Subquery<Long> perfilSemAcesso(CriteriaQuery<?> query, CriteriaBuilder cb,
            Join<DadosAutenticacao, DadosPessoais> pessoa) {
        var sub = query.subquery(Long.class);
        Root<DadosPessoais> dp = sub.from(DadosPessoais.class);
        Join<DadosPessoais, Perfil> p = dp.join("perfis");

        var grupoAtivo = sub.subquery(Long.class);
        Root<GrupoUsuarioMembro> m = grupoAtivo.from(GrupoUsuarioMembro.class);
        Join<GrupoUsuarioMembro, GrupoUsuario> g = m.join("grupoUsuario");
        grupoAtivo.select(m.get("id")).where(
                cb.equal(m.get("dadosPessoais"), dp),
                cb.equal(g.get("perfil"), p),
                cb.isTrue(g.get("ativo")));

        sub.select(dp.get("id")).where(
                cb.equal(dp, pessoa),
                cb.notEqual(p.get("nome"), PerfilNome.ADMIN),
                cb.not(cb.exists(grupoAtivo)));
        return sub;
    }

    /** As mesmas regras de DadosAutenticacao.getSituacao, em SQL. */
    private static Predicate situacao(CriteriaBuilder cb, Root<DadosAutenticacao> login, SituacaoLogin situacao) {
        var semMotivo = cb.isNull(login.get("motivoDesativacao"));
        var verificado = cb.isTrue(cb.coalesce(login.<Boolean>get("verificado"), false));
        var ativo = cb.isTrue(cb.coalesce(login.<Boolean>get("ativo"), false));
        return switch (situacao) {
            case AGUARDANDO_VERIFICACAO -> cb.and(semMotivo, cb.not(verificado));
            case ATIVO -> cb.and(semMotivo, verificado, ativo);
            case DESATIVADO -> cb.or(cb.not(semMotivo), cb.and(verificado, cb.not(ativo)));
        };
    }
}
