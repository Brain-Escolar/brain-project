package br.com.brain.turma;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TurmaRepository extends JpaRepository<Turma, Long> {

    long countByAnoLetivo(int anoLetivo);

    /** Turmas do ano letivo com unidade e série carregadas, na ordem em que a escola as lê. */
    @Query("""
            SELECT t FROM Turma t JOIN FETCH t.unidade u JOIN FETCH t.serie s
            WHERE t.anoLetivo = :anoLetivo
            ORDER BY u.nome, s.nome, t.nome
            """)
    List<Turma> findDoAnoLetivoComUnidadeESerie(@Param("anoLetivo") int anoLetivo);
}
