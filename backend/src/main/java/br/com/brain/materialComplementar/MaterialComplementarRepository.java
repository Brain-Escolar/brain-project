package br.com.brain.materialComplementar;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MaterialComplementarRepository extends JpaRepository<MaterialComplementar, Long> {

    List<MaterialComplementar> findByProfessorIdOrderByCriadoEmDesc(Long professorId);

    @Query("""
                SELECT mc FROM MaterialComplementar mc
                WHERE EXISTS (
                    SELECT 1 FROM Aula a
                    WHERE a.turma.id = :turmaId
                    AND a.disciplina.id = mc.disciplina.id
                    AND a.professor.id = mc.professor.id
                )
                ORDER BY mc.criadoEm DESC
            """)
    List<MaterialComplementar> findByTurmaIdOrderByCriadoEmDesc(@Param("turmaId") Long turmaId);
}
