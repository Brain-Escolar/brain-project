package br.com.brain.responsavel.domain;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ResponsavelRepository extends JpaRepository<Responsavel, Long> {

  Optional<Responsavel> findByDadosPessoaisCpf(String cpf);
}
