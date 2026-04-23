package br.com.brain.shared.dependente;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DependenteRepository extends JpaRepository<Dependente, Long> {

    List<Dependente> findByResponsavelId(Long responsavelId);
}
