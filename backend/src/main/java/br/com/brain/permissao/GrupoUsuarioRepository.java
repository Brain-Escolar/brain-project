package br.com.brain.permissao;

import br.com.brain.enums.PerfilNome;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GrupoUsuarioRepository extends JpaRepository<GrupoUsuario, Long> {

    /** Só os grupos normais: os individuais não aparecem na lista de grupos. */
    @Query("""
            select g from GrupoUsuario g join fetch g.perfil
            where g.dadosPessoais is null
            order by g.padrao desc, g.nome
            """)
    List<GrupoUsuario> findTodosComPerfil();

    /** Só grupos normais: um id de grupo individual responde como inexistente. */
    @Query("select g from GrupoUsuario g join fetch g.perfil where g.id = :id and g.dadosPessoais is null")
    Optional<GrupoUsuario> findComPerfilById(@Param("id") Long id);

    @Query("select g from GrupoUsuario g where g.padrao = true and g.perfil.nome = :perfil")
    Optional<GrupoUsuario> findPadraoDoPerfil(@Param("perfil") PerfilNome perfil);

    @Query("""
            select g from GrupoUsuario g join fetch g.perfil
            where g.perfil.nome = :perfil and g.dadosPessoais.id = :dadosPessoaisId
            """)
    Optional<GrupoUsuario> findIndividual(@Param("perfil") PerfilNome perfil,
            @Param("dadosPessoaisId") Long dadosPessoaisId);

    /** Grupos individuais do perfil entre as pessoas informadas (contador da aba Pessoas). */
    @Query("select g from GrupoUsuario g where g.perfil.id = :perfilId and g.dadosPessoais.id in :ids")
    List<GrupoUsuario> findIndividuaisEntre(@Param("perfilId") Long perfilId, @Param("ids") Collection<Long> ids);

    boolean existsByPerfilIdAndNomeIgnoreCase(Long perfilId, String nome);

    boolean existsByPerfilIdAndNomeIgnoreCaseAndIdNot(Long perfilId, String nome, Long id);
}
