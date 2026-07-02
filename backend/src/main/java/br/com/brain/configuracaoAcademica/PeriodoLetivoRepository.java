package br.com.brain.configuracaoAcademica;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PeriodoLetivoRepository extends JpaRepository<PeriodoLetivo, Long> {

    List<PeriodoLetivo> findByAnoLetivoOrderBySequenciaAsc(Integer anoLetivo);
}
