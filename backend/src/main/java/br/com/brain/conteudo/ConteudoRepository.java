package br.com.brain.conteudo;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ConteudoRepository extends JpaRepository<Conteudo, Long> {
    Optional<Conteudo> findByAulaIdAndData(Long aulaId, LocalDate data);
}
