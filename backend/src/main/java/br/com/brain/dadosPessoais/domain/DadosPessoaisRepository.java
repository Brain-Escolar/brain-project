package br.com.brain.dadosPessoais.domain;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface DadosPessoaisRepository extends JpaRepository<DadosPessoais, Long> {

    Optional<DadosPessoais> findByCpf(String cpf);
}
