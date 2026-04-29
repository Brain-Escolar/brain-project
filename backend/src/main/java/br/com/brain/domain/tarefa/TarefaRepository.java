package br.com.brain.domain.tarefa;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TarefaRepository extends JpaRepository<Tarefa, Long> {

    Page<Tarefa> findByProfessorIdAndPrazoAfter(Long id, LocalDate hoje, Pageable paginacao);

    List<Tarefa> findByTurmaIdAndPrazo(Long turmaId, LocalDate prazo);

    @Query("SELECT DISTINCT t.prazo FROM Tarefa t WHERE t.turma.id = :turmaId ORDER BY t.prazo")
    List<LocalDate> findDistinctPrazoByTurmaId(@Param("turmaId") Long turmaId);

}
