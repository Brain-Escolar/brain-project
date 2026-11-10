package br.com.brain.permissao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GrupoUsuarioControleRepository extends JpaRepository<GrupoUsuarioControle, Long> {

    @Query("select gc from GrupoUsuarioControle gc join fetch gc.controle where gc.grupoUsuario.id = :grupoId")
    List<GrupoUsuarioControle> findComControleByGrupo(@Param("grupoId") Long grupoId);

    @Query("""
            select new br.com.brain.permissao.ContagemPorGrupo(gc.grupoUsuario.id, count(gc))
            from GrupoUsuarioControle gc group by gc.grupoUsuario.id
            """)
    List<ContagemPorGrupo> contarPorGrupo();
}
