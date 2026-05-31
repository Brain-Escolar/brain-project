package br.com.brain.disciplina.repository;
import br.com.brain.disciplina.models.*;

import org.springframework.data.jpa.repository.JpaRepository;

public interface DisciplinaRepository extends JpaRepository<Disciplina, Long> {
}
