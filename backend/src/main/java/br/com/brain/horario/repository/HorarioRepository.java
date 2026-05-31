package br.com.brain.horario.repository;
import br.com.brain.horario.models.*;

import org.springframework.data.jpa.repository.JpaRepository;

public interface HorarioRepository extends JpaRepository<Horario, Long> {
}
