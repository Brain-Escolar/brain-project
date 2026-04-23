package br.com.brain.planejamentoAnual.domain;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PlanejamentoAnualRepository extends JpaRepository<PlanejamentoAnual, Long> {

    Optional<PlanejamentoAnual> findByAno(Integer ano);
}
