package br.com.brain.domain.evento;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventoRepository extends JpaRepository<Evento, Long> {

    Page<Evento> findAllByTurmaId(Long turmaId, Pageable pageable);

    Page<Evento> findAllBySerieId(Long serieId, Pageable pageable);

    Page<Evento> findAllByUnidadeId(Long unidadeId, Pageable pageable);

    Page<Evento> findAllByProfessorId(Long professorId, Pageable pageable);
}
