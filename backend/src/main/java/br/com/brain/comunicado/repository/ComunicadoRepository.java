package br.com.brain.comunicado.repository;
import br.com.brain.comunicado.models.*;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ComunicadoRepository extends JpaRepository<Comunicado, Long> {
}
