package br.com.brain.escolaridade.repository;
import br.com.brain.escolaridade.models.*;

import org.springframework.data.jpa.repository.JpaRepository;

public interface EscolaridadeRepository extends JpaRepository<Escolaridade, Long> {
}
