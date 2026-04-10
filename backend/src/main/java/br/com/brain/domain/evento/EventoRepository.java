package br.com.brain.domain.evento;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EventoRepository extends JpaRepository<Evento, Long> {

    @Query(value = "SELECT * FROM eventos WHERE turma_id = :turmaId ORDER BY ABS(data_evento - CURRENT_DATE)",
           countQuery = "SELECT COUNT(*) FROM eventos WHERE turma_id = :turmaId",
           nativeQuery = true)
    Page<Evento> findAllByTurmaId(@Param("turmaId") Long turmaId, Pageable pageable);

    @Query(value = "SELECT * FROM eventos WHERE serie_id = :serieId ORDER BY ABS(data_evento - CURRENT_DATE)",
           countQuery = "SELECT COUNT(*) FROM eventos WHERE serie_id = :serieId",
           nativeQuery = true)
    Page<Evento> findAllBySerieId(@Param("serieId") Long serieId, Pageable pageable);

    @Query(value = "SELECT * FROM eventos WHERE unidade_id = :unidadeId ORDER BY ABS(data_evento - CURRENT_DATE)",
           countQuery = "SELECT COUNT(*) FROM eventos WHERE unidade_id = :unidadeId",
           nativeQuery = true)
    Page<Evento> findAllByUnidadeId(@Param("unidadeId") Long unidadeId, Pageable pageable);

    @Query(value = "SELECT * FROM eventos WHERE professor_id = :professorId ORDER BY ABS(data_evento - CURRENT_DATE)",
           countQuery = "SELECT COUNT(*) FROM eventos WHERE professor_id = :professorId",
           nativeQuery = true)
    Page<Evento> findAllByProfessorId(@Param("professorId") Long professorId, Pageable pageable);

    @Query(value = "SELECT * FROM eventos ORDER BY ABS(data_evento - CURRENT_DATE)",
           countQuery = "SELECT COUNT(*) FROM eventos",
           nativeQuery = true)
    Page<Evento> findAllOrderByClosestDate(Pageable pageable);
}
