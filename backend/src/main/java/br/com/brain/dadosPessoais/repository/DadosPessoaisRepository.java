package br.com.brain.dadosPessoais.repository;
import br.com.brain.dadosPessoais.models.*;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface DadosPessoaisRepository extends JpaRepository<DadosPessoais, Long> {

    Optional<DadosPessoais> findByCpf(String cpf);
}
