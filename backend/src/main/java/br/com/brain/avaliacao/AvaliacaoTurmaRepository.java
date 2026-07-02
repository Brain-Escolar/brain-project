package br.com.brain.avaliacao;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AvaliacaoTurmaRepository extends JpaRepository<AvaliacaoTurma, Long> {

    List<AvaliacaoTurma> findByAvaliacaoId(Long avaliacaoId);

    List<AvaliacaoTurma> findByAvaliacaoIdAndProfessorId(Long avaliacaoId, Long professorId);

    Optional<AvaliacaoTurma> findByAvaliacaoIdAndTurmaId(Long avaliacaoId, Long turmaId);

    List<AvaliacaoTurma> findByProfessorId(Long professorId);
}
