package br.com.brain.tarefa.domain;

import java.time.LocalDate;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TarefaRepository extends JpaRepository<Tarefa, Long> {

    Page<Tarefa> findByProfessorIdAndPrazoAfter(Long id, LocalDate hoje, Pageable paginacao);

}
