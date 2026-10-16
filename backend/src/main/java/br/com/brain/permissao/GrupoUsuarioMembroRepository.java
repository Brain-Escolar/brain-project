package br.com.brain.permissao;

import br.com.brain.permissao.dto.PessoaGrupoDto;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * As buscas recebem o padrão já pronto ("%texto%" em minúsculas) em vez de um
 * parâmetro opcional: "(:busca is null or ...)" quebra no PostgreSQL, que não
 * consegue inferir o tipo de um parâmetro nulo.
 */
public interface GrupoUsuarioMembroRepository extends JpaRepository<GrupoUsuarioMembro, Long> {

    List<GrupoUsuarioMembro> findByGrupoUsuarioId(Long grupoId);

    Optional<GrupoUsuarioMembro> findByGrupoUsuarioIdAndDadosPessoaisId(Long grupoId, Long dadosPessoaisId);

    long countByGrupoUsuarioId(Long grupoId);

    @Query("""
            select m.dadosPessoais.id from GrupoUsuarioMembro m
            where m.grupoUsuario.id = :grupoId and m.dadosPessoais.id in :ids
            """)
    Set<Long> findMembrosEntre(@Param("grupoId") Long grupoId, @Param("ids") Collection<Long> ids);

    @Query("""
            select new br.com.brain.permissao.ContagemPorGrupo(m.grupoUsuario.id, count(m))
            from GrupoUsuarioMembro m group by m.grupoUsuario.id
            """)
    List<ContagemPorGrupo> contarPorGrupo();

    /** Membros do grupo, com ou sem login (o seed incluiu todo mundo com o perfil). */
    @Query(value = """
            select new br.com.brain.permissao.dto.PessoaGrupoDto(dp.id, dp.nome, dp.nomeSocial, da.email)
            from GrupoUsuarioMembro m
            join m.dadosPessoais dp
            left join DadosAutenticacao da on da.dadosPessoais = dp
            where m.grupoUsuario.id = :grupoId
              and (lower(coalesce(dp.nome, '')) like :padrao
                   or lower(coalesce(dp.nomeSocial, '')) like :padrao
                   or lower(coalesce(da.email, '')) like :padrao)
            order by dp.nome
            """,
            countQuery = """
            select count(m)
            from GrupoUsuarioMembro m
            join m.dadosPessoais dp
            left join DadosAutenticacao da on da.dadosPessoais = dp
            where m.grupoUsuario.id = :grupoId
              and (lower(coalesce(dp.nome, '')) like :padrao
                   or lower(coalesce(dp.nomeSocial, '')) like :padrao
                   or lower(coalesce(da.email, '')) like :padrao)
            """)
    Page<PessoaGrupoDto> buscarMembros(@Param("grupoId") Long grupoId, @Param("padrao") String padrao,
            Pageable pageable);

    /**
     * Quem pode entrar no grupo: tem login, tem o perfil do grupo e ainda não
     * está nele.
     */
    @Query(value = """
            select new br.com.brain.permissao.dto.PessoaGrupoDto(dp.id, dp.nome, dp.nomeSocial, da.email)
            from DadosAutenticacao da
            join da.dadosPessoais dp
            join dp.perfis p
            where p.id = :perfilId
              and not exists (select 1 from GrupoUsuarioMembro m
                              where m.grupoUsuario.id = :grupoId and m.dadosPessoais = dp)
              and (lower(coalesce(dp.nome, '')) like :padrao
                   or lower(coalesce(dp.nomeSocial, '')) like :padrao
                   or lower(coalesce(da.email, '')) like :padrao)
            order by dp.nome
            """,
            countQuery = """
            select count(da)
            from DadosAutenticacao da
            join da.dadosPessoais dp
            join dp.perfis p
            where p.id = :perfilId
              and not exists (select 1 from GrupoUsuarioMembro m
                              where m.grupoUsuario.id = :grupoId and m.dadosPessoais = dp)
              and (lower(coalesce(dp.nome, '')) like :padrao
                   or lower(coalesce(dp.nomeSocial, '')) like :padrao
                   or lower(coalesce(da.email, '')) like :padrao)
            """)
    Page<PessoaGrupoDto> buscarCandidatos(@Param("grupoId") Long grupoId, @Param("perfilId") Long perfilId,
            @Param("padrao") String padrao, Pageable pageable);

    /**
     * Telas que os grupos ativos da pessoa concedem, por perfil do grupo, só as
     * ativas e dentro do teto do perfil (RP1). Quem chama descarta os perfis
     * que a pessoa não tem mais.
     */
    @Query("""
            select distinct new br.com.brain.permissao.ItemPorPerfil(g.perfil.nome, t.codigo)
            from GrupoUsuarioMembro m
            join m.grupoUsuario g
            join GrupoUsuarioTela gt on gt.grupoUsuario = g
            join gt.tela t
            join t.perfisPermitidos teto
            where m.dadosPessoais.id = :dadosPessoaisId
              and g.ativo = true and t.ativo = true and teto = g.perfil
            """)
    List<ItemPorPerfil> findTelasEfetivas(@Param("dadosPessoaisId") Long dadosPessoaisId);

    /** O mesmo da consulta de telas, para os controles. */
    @Query("""
            select distinct new br.com.brain.permissao.ItemPorPerfil(g.perfil.nome, c.codigo)
            from GrupoUsuarioMembro m
            join m.grupoUsuario g
            join GrupoUsuarioControle gc on gc.grupoUsuario = g
            join gc.controle c
            join c.perfisPermitidos teto
            where m.dadosPessoais.id = :dadosPessoaisId
              and g.ativo = true and c.ativo = true and teto = g.perfil
            """)
    List<ItemPorPerfil> findControlesEfetivos(@Param("dadosPessoaisId") Long dadosPessoaisId);

    /** Das pessoas informadas, as que têm o perfil (só elas podem entrar no grupo). */
    @Query("select dp.id from DadosPessoais dp join dp.perfis p where p.id = :perfilId and dp.id in :ids")
    Set<Long> findComPerfilEntre(@Param("perfilId") Long perfilId, @Param("ids") Collection<Long> ids);
}
