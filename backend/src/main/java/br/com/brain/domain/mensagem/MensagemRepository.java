package br.com.brain.domain.mensagem;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MensagemRepository extends JpaRepository<Mensagem, Long> {

    Page<Mensagem> findByConversaId(Long conversaId, Pageable pageable);
}
