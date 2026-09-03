package br.com.brain.comunicado;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;

public interface ComunicadoRepository extends JpaRepository<Comunicado, Long> {

    long countByDataBetween(LocalDate inicio, LocalDate fim);
}
