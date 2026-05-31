package br.com.brain.alerta.repository;
import br.com.brain.alerta.models.*;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AlertaUsuarioRepository extends JpaRepository<AlertaUsuario, AlertaUsuarioId> {
    Optional<AlertaUsuario> findByAlertaIdAndUsuarioId(Long alertaId, Long usuarioId);
}
