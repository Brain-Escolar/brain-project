package br.com.brain.coordenador.repository;
import br.com.brain.coordenador.models.*;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CoordenadorRepository extends JpaRepository<Coordenador, Long> {
}
