package br.com.brain.configuracaoAcademica;

import br.com.brain.enums.StatusAnoLetivo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AnoLetivoRepository extends JpaRepository<AnoLetivo, Integer> {

    Optional<AnoLetivo> findFirstByStatus(StatusAnoLetivo status);

    List<AnoLetivo> findAllByOrderByAnoDesc();
}
