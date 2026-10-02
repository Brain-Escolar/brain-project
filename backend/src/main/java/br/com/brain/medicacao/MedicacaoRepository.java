package br.com.brain.medicacao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MedicacaoRepository extends JpaRepository<Medicacao, Long> {

    List<Medicacao> findByFichaMedicaIdAndAtivaTrueOrderByNomeAsc(Long fichaMedicaId);
}
