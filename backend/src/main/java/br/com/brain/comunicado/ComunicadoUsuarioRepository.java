package br.com.brain.comunicado;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ComunicadoUsuarioRepository extends JpaRepository<ComunicadoUsuario, ComunicadoUsuarioId> {

    @Modifying
    @Query("delete from ComunicadoUsuario cu where cu.comunicadoId.id = :comunicadoId")
    void deleteByComunicadoId(@Param("comunicadoId") Long comunicadoId);
}
