package br.com.brain.telefone.repository;
import br.com.brain.telefone.models.*;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TelefoneRepository extends JpaRepository<Telefone, Long> {
}
