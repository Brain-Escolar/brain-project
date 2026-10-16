package br.com.brain.permissao;

import br.com.brain.enums.PerfilNome;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GrupoUsuarioRepository extends JpaRepository<GrupoUsuario, Long> {

    @Query("select g from GrupoUsuario g join fetch g.perfil order by g.padrao desc, g.nome")
    List<GrupoUsuario> findTodosComPerfil();

    @Query("select g from GrupoUsuario g join fetch g.perfil where g.id = :id")
    Optional<GrupoUsuario> findComPerfilById(@Param("id") Long id);

    @Query("select g from GrupoUsuario g where g.padrao = true and g.perfil.nome = :perfil")
    Optional<GrupoUsuario> findPadraoDoPerfil(@Param("perfil") PerfilNome perfil);

    boolean existsByPerfilIdAndNomeIgnoreCase(Long perfilId, String nome);

    boolean existsByPerfilIdAndNomeIgnoreCaseAndIdNot(Long perfilId, String nome, Long id);
}
