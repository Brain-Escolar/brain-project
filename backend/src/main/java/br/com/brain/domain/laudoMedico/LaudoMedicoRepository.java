package br.com.brain.domain.laudoMedico;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LaudoMedicoRepository extends JpaRepository<LaudoMedico, Long> {

    Page<LaudoMedico> findByFichaMedicaId(Long fichaMedicaId, Pageable pageable);
}
