package br.com.brain.alerta.repository;
import br.com.brain.alerta.models.*;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AlertaRepository extends JpaRepository<Alerta, Long> {
}
