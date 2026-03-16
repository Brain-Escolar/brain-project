package br.com.brain.domain.disponibilidadeProfessor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DisponibilidadeProfessorRepository extends JpaRepository<DisponibilidadeProfessor, Long> {

    Page<DisponibilidadeProfessor> findByProfessorId(Pageable pageable, Long professorId);
}
