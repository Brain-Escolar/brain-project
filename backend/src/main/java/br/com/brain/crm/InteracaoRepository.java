package br.com.brain.crm;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InteracaoRepository extends JpaRepository<Interacao, Long> {

    List<Interacao> findByProcessoIdOrderByCriadoEmDesc(Long processoId);
}
