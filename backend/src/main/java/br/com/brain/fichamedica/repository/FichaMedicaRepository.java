package br.com.brain.fichamedica.repository;
import br.com.brain.fichamedica.models.*;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FichaMedicaRepository extends JpaRepository<FichaMedica, Long> {

    Optional<FichaMedica> findByDadosPessoaisId(Long dadosPessoaisId);
}
