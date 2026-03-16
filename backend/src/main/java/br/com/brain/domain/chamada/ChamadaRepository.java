package br.com.brain.domain.chamada;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ChamadaRepository extends JpaRepository<Chamada, Long> {
    Optional<Chamada> findByAulaIdAndData(Long aulaId, LocalDate data);

    @Query("SELECT COUNT(c) FROM Chamada c WHERE c.aluno.id = :alunoId AND c.aula.disciplina.id = :disciplinaId AND c.presente = false")
    Integer countFaltasByAlunoAndDisciplina(@Param("alunoId") Long alunoId, @Param("disciplinaId") Long disciplinaId);
}
