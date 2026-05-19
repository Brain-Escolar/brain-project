package br.com.brain.domain.conversa;

import br.com.brain.enums.PerfilNome;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConversaRepository extends JpaRepository<Conversa, Long> {

    Page<Conversa> findByDestinatarioNome(PerfilNome perfilNome, Pageable pageable);

    Page<Conversa> findByRemetenteId(Long remetenteId, Pageable pageable);
}
