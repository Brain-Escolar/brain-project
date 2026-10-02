package br.com.brain.notas;

import br.com.brain.turma.Turma;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotasRepository extends JpaRepository<Notas, Long> {

    long countByAvaliacaoTurmaId(Long avaliacaoTurmaId);

    List<Notas> findByAlunoIdAndAvaliacaoTurmaAvaliacaoDisciplinaId(Long alunoId, Long disciplinaId);

    /** Turmas em que o aluno já teve nota lançada — a trilha dele ano a ano. */
    @Query("SELECT DISTINCT at.turma FROM Notas n JOIN n.avaliacaoTurma at WHERE n.aluno.id = :alunoId")
    List<Turma> findTurmasComNotaDoAluno(@Param("alunoId") Long alunoId);
}
