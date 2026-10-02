package br.com.brain.situacaoFamiliar;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SituacaoFamiliarOpcaoRepository extends JpaRepository<SituacaoFamiliarOpcao, Long> {

    List<SituacaoFamiliarOpcao> findByAtivoTrueOrderByOrdemAsc();
}
