package br.com.brain.disciplina;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface DisciplinaRepository extends JpaRepository<Disciplina, Long> {

    List<Disciplina> findBySerieIdOrderByNomeAsc(Long serieId);
}
