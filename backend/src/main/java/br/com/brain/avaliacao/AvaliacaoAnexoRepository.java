package br.com.brain.avaliacao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AvaliacaoAnexoRepository extends JpaRepository<AvaliacaoAnexo, Long> {

    List<AvaliacaoAnexo> findByAvaliacaoId(Long avaliacaoId);
}
