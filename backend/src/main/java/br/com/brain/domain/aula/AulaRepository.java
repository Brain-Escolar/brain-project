package br.com.brain.domain.aula;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.com.brain.domain.disciplina.Disciplina;
import br.com.brain.domain.turma.Turma;

public interface AulaRepository extends JpaRepository<Aula, Long> {
    Page<Aula> findByProfessorIdAndDiaSemana(Long professorId, DayOfWeek diaSemana, Pageable pageable);

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
}
