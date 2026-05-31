package br.com.brain.orientador.repository;
import br.com.brain.orientador.models.*;

import org.springframework.data.jpa.repository.JpaRepository;

public interface OrientadorRepository extends JpaRepository<Orientador, Long> {
}
