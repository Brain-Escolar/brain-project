package br.com.brain.tarefa;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TarefaRepository extends JpaRepository<Tarefa, Long> {

    Page<Tarefa> findByProfessorIdAndPrazoAfter(Long id, LocalDate hoje, Pageable paginacao);

    Page<Tarefa> findByProfessorId(Long id, Pageable paginacao);

    @Query("""
                SELECT t FROM Tarefa t
                WHERE t.aula.turma.id = :turmaId
                AND t.aula.disciplina.id = :disciplinaId
                AND t.prazo = :prazo
            """)
    List<Tarefa> findByAulaTurmaIdAndAulaDisciplinaIdAndPrazo(
            @Param("turmaId") Long turmaId,
            @Param("disciplinaId") Long disciplinaId,
            @Param("prazo") LocalDate prazo);

    @Query("""
                SELECT DISTINCT t.prazo FROM Tarefa t
                WHERE t.aula.turma.id = :turmaId
                AND t.aula.disciplina.id = :disciplinaId
                ORDER BY t.prazo
            """)
    List<LocalDate> findDistinctPrazoByAulaTurmaIdAndAulaDisciplinaId(
            @Param("turmaId") Long turmaId,
            @Param("disciplinaId") Long disciplinaId);

    Page<Tarefa> findByAulaTurmaIdAndPrazoGreaterThanEqual(Long turmaId, LocalDate hoje, Pageable paginacao);

    List<Tarefa> findByAulaIdAndDataCriacaoOrderByIdDesc(Long aulaId, LocalDate dataCriacao);
}
