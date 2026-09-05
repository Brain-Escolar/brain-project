package br.com.brain.crm;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HistoricoEstagioRepository extends JpaRepository<HistoricoEstagio, Long> {

    List<HistoricoEstagio> findByProcessoIdOrderByDataEntradaAsc(Long processoId);

    Optional<HistoricoEstagio> findByProcessoIdAndDataSaidaIsNull(Long processoId);

    List<HistoricoEstagio> findByEstagioId(Long estagioId);
}
