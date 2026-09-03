package br.com.brain.comunicado;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;

public interface ComunicadoRepository extends JpaRepository<Comunicado, Long> {

    long countByDataBetween(LocalDate inicio, LocalDate fim);

    /**
     * Comunicados que o usuário pode ver no mural: os endereçados a ele e os que não têm
     * público definido — caso dos comunicados criados antes do recurso de destinatários.
     */
    @Query("""
            SELECT comunicado FROM Comunicado comunicado
            WHERE NOT EXISTS (
                    SELECT 1 FROM ComunicadoDestinatario destinatario
                    WHERE destinatario.comunicado = comunicado)
               OR EXISTS (
                    SELECT 1 FROM ComunicadoUsuario entrega
                    WHERE entrega.comunicadoId = comunicado AND entrega.usuarioId.id = :usuarioId)
            """)
    Page<Comunicado> findVisiveisPara(@Param("usuarioId") Long usuarioId, Pageable paginacao);
}
