package br.com.brain.avaliacao.domain;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Long> {

    Page<Avaliacao> findByProfessorId(Long professorId, Pageable pageable);
}
