package br.com.brain.planejamentoAnual.repository;
import br.com.brain.planejamentoAnual.models.*;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PlanejamentoAnualRepository extends JpaRepository<PlanejamentoAnual, Long> {

    Optional<PlanejamentoAnual> findByAno(Integer ano);
}
