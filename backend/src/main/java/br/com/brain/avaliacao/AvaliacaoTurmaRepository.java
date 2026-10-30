package br.com.brain.avaliacao;

import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AvaliacaoTurmaRepository extends JpaRepository<AvaliacaoTurma, Long> {

    List<AvaliacaoTurma> findByAvaliacaoId(Long avaliacaoId);

    List<AvaliacaoTurma> findByAvaliacaoIdAndProfessorId(Long avaliacaoId, Long professorId);

    Optional<AvaliacaoTurma> findByAvaliacaoIdAndTurmaId(Long avaliacaoId, Long turmaId);

    List<AvaliacaoTurma> findByProfessorId(Long professorId);

    /** Avaliações aplicadas no intervalo nas turmas do ano letivo, com avaliação e turma carregadas. */
    @Query("""
            SELECT at FROM AvaliacaoTurma at
            JOIN FETCH at.avaliacao a LEFT JOIN FETCH a.disciplina
            JOIN FETCH at.turma t LEFT JOIN FETCH t.serie
            WHERE t.anoLetivo = :anoLetivo AND at.professor IS NOT NULL
              AND at.dataAplicacao BETWEEN :inicio AND :fim
            ORDER BY at.dataAplicacao, a.nome
            """)
    List<AvaliacaoTurma> findAplicadasNoPeriodo(@Param("anoLetivo") int anoLetivo,
            @Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    /** Avaliações de um professor aplicadas no intervalo, com avaliação e turma carregadas. */
    @Query("""
            SELECT at FROM AvaliacaoTurma at
            JOIN FETCH at.avaliacao a LEFT JOIN FETCH a.disciplina
            JOIN FETCH at.turma t LEFT JOIN FETCH t.serie
            WHERE t.anoLetivo = :anoLetivo AND at.professor.id = :professorId
              AND at.dataAplicacao BETWEEN :inicio AND :fim
            ORDER BY at.dataAplicacao, a.nome
            """)
    List<AvaliacaoTurma> findDoProfessorAplicadasNoPeriodo(@Param("anoLetivo") int anoLetivo,
            @Param("professorId") Long professorId, @Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);
}
