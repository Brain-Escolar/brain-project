package br.com.brain.bolsa;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PoliticaBolsaRepository extends JpaRepository<PoliticaBolsa, Long> {

    Optional<PoliticaBolsa> findByAnoLetivo(Integer anoLetivo);

    boolean existsByAnoLetivo(Integer anoLetivo);

    /** Ano corrente primeiro: e nele que se mexe. */
    List<PoliticaBolsa> findAllByOrderByAnoLetivoDesc();
}
