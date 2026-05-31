package br.com.brain.mensagem.repository;
import br.com.brain.mensagem.models.*;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MensagemLidaRepository extends JpaRepository<MensagemLida, MensagemLidaId> {

    boolean existsByMensagemIdAndDadosPessoaisId(Long mensagemId, Long dadosPessoaisId);
}
