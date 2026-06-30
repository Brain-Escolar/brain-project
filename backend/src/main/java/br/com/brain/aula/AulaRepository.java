package br.com.brain.aula;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.com.brain.disciplina.Disciplina;
import br.com.brain.turma.Turma;

public interface AulaRepository extends JpaRepository<Aula, Long> {
    Page<Aula> findByProfessorIdAndDiaSemana(Long professorId, DayOfWeek diaSemana, Pageable pageable);

    Page<Aula> findByTurmaIdAndDiaSemana(Long turmaId, DayOfWeek diaSemana, Pageable pageable);

    @Query("""
                SELECT aula.disciplina
                FROM Aula aula
                WHERE aula.professor.id = :professorId
                AND aula.vigencia BETWEEN :dataInicio AND :dataFim
            """)
    List<Disciplina> findDisciplinasByProfessorIdAndData(@Param("professorId") Long professorId,
            @Param("dataInicio") LocalDate dataInicio,
            @Param("dataFim") LocalDate dataFim);

    @Query("""
                SELECT aula.turma
                FROM Aula aula
                WHERE aula.disciplina.id = :disciplinaId
            """)
    List<Turma> findTurmasByDisciplinaId(@Param("disciplinaId") Long disciplinaId);

    List<Aula> findByProfessorIdAndVigenciaBetween(Long id, LocalDate dataInicio, LocalDate dataFim);

    List<Aula> findByProfessorId(Long professorId);

    boolean existsByProfessorIdAndTurmaIdAndDisciplinaId(Long professorId, Long turmaId, Long disciplinaId);

    List<Aula> findByDisciplinaId(Long disciplinaId);

    List<Aula> findByProfessorIdAndDiaSemanaIn(Long professorId, List<DayOfWeek> dias, Sort sort);

    List<Aula> findByTurmaIdAndDiaSemanaIn(Long turmaId, List<DayOfWeek> dias, Sort sort);

    @Query("""
                SELECT a FROM Aula a
                WHERE a.professor.id = :professorId
                AND a.disciplina.id = :disciplinaId
                AND a.turma.serie.id = :serieId
                ORDER BY a.turma.id ASC, a.diaSemana ASC, a.horario.horarioInicio ASC
            """)
    List<Aula> findByProfessorIdAndDisciplinaIdAndSerieId(
            @Param("professorId") Long professorId,
            @Param("disciplinaId") Long disciplinaId,
            @Param("serieId") Long serieId);
}
