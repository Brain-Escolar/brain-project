package br.com.brain.dependente.repository;
import br.com.brain.dependente.models.*;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DependenteRepository extends JpaRepository<Dependente, Long> {

    List<Dependente> findByResponsavelId(Long responsavelId);
}
