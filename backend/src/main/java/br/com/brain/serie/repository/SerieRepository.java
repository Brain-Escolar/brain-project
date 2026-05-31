package br.com.brain.serie.repository;
import br.com.brain.serie.models.*;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SerieRepository extends JpaRepository<Serie, Long> {
}
