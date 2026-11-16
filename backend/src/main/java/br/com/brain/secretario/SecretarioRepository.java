package br.com.brain.secretario;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SecretarioRepository extends JpaRepository<Secretario, Long> {

    boolean existsByDadosPessoaisId(Long dadosPessoaisId);

    Optional<Secretario> findFirstByDadosPessoaisId(Long dadosPessoaisId);
}
