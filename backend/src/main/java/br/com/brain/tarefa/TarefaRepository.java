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

    List<Tarefa> findByAulaIdAndPrazo(Long aulaId, LocalDate prazo);

    @Query("SELECT DISTINCT t.prazo FROM Tarefa t WHERE t.aula.id = :aulaId ORDER BY t.prazo")
    List<LocalDate> findDistinctPrazoByAulaId(@Param("aulaId") Long aulaId);

    Page<Tarefa> findByAulaTurmaIdAndPrazoGreaterThanEqual(Long turmaId, LocalDate hoje, Pageable paginacao);

    List<Tarefa> findByAulaIdAndDataCriacaoOrderByIdDesc(Long aulaId, LocalDate dataCriacao);
}
