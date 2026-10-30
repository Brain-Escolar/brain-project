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

import br.com.brain.diretor.projecao.ProfessorDaDisciplina;
import br.com.brain.disciplina.Disciplina;
import br.com.brain.turma.Turma;

public interface AulaRepository extends JpaRepository<Aula, Long> {
    /*
     * Consultas "do professor" sao sempre de um ano letivo: a grade de aulas e
     * por turma, e turma e de um ano. Sem o filtro, a agenda de 2027 traria as
     * aulas de 2026 junto.
     */

    Page<Aula> findByProfessorIdAndTurmaAnoLetivoAndDiaSemana(Long professorId, int anoLetivo, DayOfWeek diaSemana,
            Pageable pageable);

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
                SELECT DISTINCT aula.turma
                FROM Aula aula
                WHERE aula.disciplina.id = :disciplinaId
                AND aula.turma.anoLetivo = :anoLetivo
            """)
    List<Turma> findTurmasByDisciplinaIdNoAno(@Param("disciplinaId") Long disciplinaId,
            @Param("anoLetivo") int anoLetivo);

    List<Aula> findByProfessorIdAndVigenciaBetween(Long id, LocalDate dataInicio, LocalDate dataFim);

    List<Aula> findByProfessorIdAndTurmaAnoLetivo(Long professorId, int anoLetivo);

    boolean existsByProfessorIdAndTurmaIdAndDisciplinaId(Long professorId, Long turmaId, Long disciplinaId);

    boolean existsByProfessorIdAndDisciplinaIdAndTurmaAnoLetivo(Long professorId, Long disciplinaId, int anoLetivo);

    @Query("""
                SELECT DISTINCT aula.disciplina.id
                FROM Aula aula
                WHERE aula.professor.id = :professorId
            """)
    List<Long> findDisciplinaIdsDistinctByProfessorId(@Param("professorId") Long professorId);

    List<Aula> findByDisciplinaIdAndTurmaId(Long disciplinaId, Long turmaId);

    List<Aula> findByProfessorIdAndTurmaAnoLetivoAndDiaSemanaIn(Long professorId, int anoLetivo,
            List<DayOfWeek> dias, Sort sort);

    List<Aula> findByTurmaIdAndDiaSemanaIn(Long turmaId, List<DayOfWeek> dias, Sort sort);

    @Query("""
                SELECT a FROM Aula a
                WHERE a.professor.id = :professorId
                AND a.disciplina.id = :disciplinaId
                AND a.turma.serie.id = :serieId
                AND a.turma.anoLetivo = :anoLetivo
                ORDER BY a.turma.id ASC, a.diaSemana ASC, a.horario.horarioInicio ASC
            """)
    List<Aula> findByProfessorIdAndDisciplinaIdAndSerieIdNoAno(
            @Param("professorId") Long professorId,
            @Param("disciplinaId") Long disciplinaId,
            @Param("serieId") Long serieId,
            @Param("anoLetivo") int anoLetivo);

    /** Professores de cada disciplina da turma, pela grade de aulas. */
    @Query("""
            SELECT DISTINCT new br.com.brain.diretor.projecao.ProfessorDaDisciplina(au.disciplina.id, dp.nome)
            FROM Aula au JOIN au.professor p JOIN p.dadosPessoais dp
            WHERE au.turma.id = :turmaId
            """)
    List<ProfessorDaDisciplina> findProfessoresPorDisciplinaDaTurma(@Param("turmaId") Long turmaId);

    /** Grade do ano letivo inteiro, com turma, disciplina, professor e horário carregados. */
    @Query("""
            SELECT au FROM Aula au
            JOIN FETCH au.turma t LEFT JOIN FETCH t.serie LEFT JOIN FETCH t.unidade
            JOIN FETCH au.disciplina
            JOIN FETCH au.professor
            LEFT JOIN FETCH au.horario
            WHERE t.anoLetivo = :anoLetivo
            """)
    List<Aula> findGradeDoAnoLetivo(@Param("anoLetivo") int anoLetivo);

    /** Grade de um professor no ano letivo, com turma, disciplina e horário carregados. */
    @Query("""
            SELECT au FROM Aula au
            JOIN FETCH au.turma t LEFT JOIN FETCH t.serie LEFT JOIN FETCH t.unidade
            JOIN FETCH au.disciplina
            JOIN FETCH au.professor
            LEFT JOIN FETCH au.horario
            WHERE t.anoLetivo = :anoLetivo AND au.professor.id = :professorId
            """)
    List<Aula> findGradeDoProfessor(@Param("anoLetivo") int anoLetivo, @Param("professorId") Long professorId);
}
