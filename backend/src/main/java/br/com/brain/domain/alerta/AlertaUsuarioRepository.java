package br.com.brain.domain.alerta;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AlertaUsuarioRepository extends JpaRepository<AlertaUsuario, AlertaUsuarioId> {
    Optional<AlertaUsuario> findByAlertaIdAndUsuarioId(Long alertaId, Long usuarioId);
}
