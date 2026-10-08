package br.com.brain.permissao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GrupoUsuarioTelaRepository extends JpaRepository<GrupoUsuarioTela, Long> {

    @Query("select gt from GrupoUsuarioTela gt join fetch gt.tela where gt.grupoUsuario.id = :grupoId")
    List<GrupoUsuarioTela> findComTelaByGrupo(@Param("grupoId") Long grupoId);

    @Query("""
            select new br.com.brain.permissao.ContagemPorGrupo(gt.grupoUsuario.id, count(gt))
            from GrupoUsuarioTela gt group by gt.grupoUsuario.id
            """)
    List<ContagemPorGrupo> contarPorGrupo();
}
