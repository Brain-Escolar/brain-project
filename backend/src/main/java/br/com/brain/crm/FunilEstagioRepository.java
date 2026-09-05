package br.com.brain.crm;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FunilEstagioRepository extends JpaRepository<FunilEstagio, Long> {
    List<FunilEstagio> findAllByOrderByOrdemAsc();

    Optional<FunilEstagio> findByOrdem(Integer ordem);

    Optional<FunilEstagio> findTopByOrderByOrdemDesc();
}
