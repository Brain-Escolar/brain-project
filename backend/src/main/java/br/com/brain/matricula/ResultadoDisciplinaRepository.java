package br.com.brain.matricula;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResultadoDisciplinaRepository extends JpaRepository<ResultadoDisciplina, Long> {

    List<ResultadoDisciplina> findByMatriculaIdOrderByDisciplinaNomeAsc(Long matriculaId);

    boolean existsByMatriculaId(Long matriculaId);
}
