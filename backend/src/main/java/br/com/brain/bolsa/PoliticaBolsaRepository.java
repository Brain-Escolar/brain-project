package br.com.brain.bolsa;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PoliticaBolsaRepository extends JpaRepository<PoliticaBolsa, Long> {

    Optional<PoliticaBolsa> findByAnoLetivo(Integer anoLetivo);
}
