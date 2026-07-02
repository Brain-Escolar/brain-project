package br.com.brain.notas;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotasRepository extends JpaRepository<Notas, Long> {

    long countByAvaliacaoTurmaId(Long avaliacaoTurmaId);

    List<Notas> findByAlunoIdAndAvaliacaoTurmaAvaliacaoDisciplinaId(Long alunoId, Long disciplinaId);
}
