package br.com.brain.disciplinaGrade.repository;
import br.com.brain.disciplinaGrade.models.*;

import org.springframework.data.jpa.repository.JpaRepository;

public interface DisciplinaGradeRepository extends JpaRepository<DisciplinaGrade, DisciplinaGradeId> {
}
