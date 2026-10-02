package br.com.brain.situacaoFamiliar;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SituacaoFamiliarRepository extends JpaRepository<SituacaoFamiliar, Long> {

    Optional<SituacaoFamiliar> findByAlunoId(Long alunoId);
}
