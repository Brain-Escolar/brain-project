package br.com.brain.turma;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TurmaRepository extends JpaRepository<Turma, Long> {

    long countByAnoLetivo(int anoLetivo);

    Page<Turma> findByAnoLetivo(int anoLetivo, Pageable pageable);

    List<Turma> findByAnoLetivoOrderByNomeAsc(int anoLetivo);

    boolean existsByAnoLetivoAndNomeAndUnidadeIdAndSerieId(int anoLetivo, String nome, Long unidadeId, Long serieId);

    /** Turmas do ano letivo com unidade e série carregadas, na ordem em que a escola as lê. */
    @Query("""
            SELECT t FROM Turma t JOIN FETCH t.unidade u JOIN FETCH t.serie s
            WHERE t.anoLetivo = :anoLetivo
            ORDER BY u.nome, s.nome, t.nome
            """)
    List<Turma> findDoAnoLetivoComUnidadeESerie(@Param("anoLetivo") int anoLetivo);
}
