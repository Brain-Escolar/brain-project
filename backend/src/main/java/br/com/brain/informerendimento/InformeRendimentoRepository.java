package br.com.brain.informerendimento;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface InformeRendimentoRepository extends JpaRepository<InformeRendimento, Long> {

    List<InformeRendimento> findByProfessorIdOrderByAnoDesc(Long professorId);
}
