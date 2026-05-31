package br.com.brain.diretor.repository;
import br.com.brain.diretor.models.*;

import org.springframework.data.jpa.repository.JpaRepository;

public interface DiretorRepository extends JpaRepository<Diretor, Long> {
}
