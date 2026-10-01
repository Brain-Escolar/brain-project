package br.com.brain.chamada;

import java.time.LocalDate;
import java.util.List;

import br.com.brain.turma.Turma;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ChamadaRepository extends JpaRepository<Chamada, Long> {
    List<Chamada> findAllByAulaIdAndDataOrderByAlunoDadosPessoaisNomeAsc(Long aulaId, LocalDate data);

    @Query("SELECT COUNT(c) FROM Chamada c WHERE c.aluno.id = :alunoId AND c.aula.disciplina.id = :disciplinaId AND c.presente = false")
    Integer countFaltasByAlunoAndDisciplina(@Param("alunoId") Long alunoId, @Param("disciplinaId") Long disciplinaId);

    @Query("SELECT COUNT(c) FROM Chamada c WHERE c.aluno.id = :alunoId AND c.aula.disciplina.id = :disciplinaId")
    Integer countTotalByAlunoAndDisciplina(@Param("alunoId") Long alunoId, @Param("disciplinaId") Long disciplinaId);

    @Query("SELECT COUNT(c) FROM Chamada c WHERE c.aluno.id = :alunoId AND c.aula.disciplina.id = :disciplinaId "
            + "AND c.presente = false AND c.data BETWEEN :inicio AND :fim")
    Integer countFaltasByAlunoAndDisciplinaAndPeriodo(@Param("alunoId") Long alunoId,
            @Param("disciplinaId") Long disciplinaId, @Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    @Query("SELECT COUNT(c) FROM Chamada c WHERE c.aluno.id = :alunoId AND c.aula.disciplina.id = :disciplinaId "
            + "AND c.data BETWEEN :inicio AND :fim")
    Integer countTotalByAlunoAndDisciplinaAndPeriodo(@Param("alunoId") Long alunoId,
            @Param("disciplinaId") Long disciplinaId, @Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    /** Turmas em que o aluno já teve chamada registrada. */
    @Query("SELECT DISTINCT c.aula.turma FROM Chamada c WHERE c.aluno.id = :alunoId")
    List<Turma> findTurmasComChamadaDoAluno(@Param("alunoId") Long alunoId);
}
