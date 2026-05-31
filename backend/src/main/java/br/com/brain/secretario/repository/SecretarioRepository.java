package br.com.brain.secretario.repository;
import br.com.brain.secretario.models.*;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SecretarioRepository extends JpaRepository<Secretario, Long> {
}
