package br.com.brain.comunicado;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface ComunicadoDestinatarioRepository extends JpaRepository<ComunicadoDestinatario, Long> {

    List<ComunicadoDestinatario> findByComunicadoId(Long comunicadoId);

    List<ComunicadoDestinatario> findByComunicadoIdIn(Collection<Long> comunicadoIds);

    void deleteByComunicadoId(Long comunicadoId);
}
