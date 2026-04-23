package br.com.brain.notas.domain;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotasRepository extends JpaRepository<Notas, Long> {

    long countByAvaliacaoId(Long avaliacaoId);

    List<Notas> findByAlunoIdAndAvaliacaoDisciplinaId(Long alunoId, Long disciplinaId);
}
