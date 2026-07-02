package br.com.brain.holerite;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface HoleriteRepository extends JpaRepository<Holerite, Long> {

    List<Holerite> findByProfessorIdOrderByAnoDescMesDesc(Long professorId);
}
