package br.com.brain.alerta;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AlertaUsuarioRepository extends JpaRepository<AlertaUsuario, AlertaUsuarioId> {
    Optional<AlertaUsuario> findByAlertaIdAndUsuarioId(Long alertaId, Long usuarioId);

    @Query("SELECT au FROM AlertaUsuario au WHERE au.usuario.id = :usuarioId ORDER BY au.alerta.data DESC")
    Page<AlertaUsuario> findByUsuarioId(@Param("usuarioId") Long usuarioId, Pageable pageable);
}
