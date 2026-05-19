package br.com.brain.domain.mensagem;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MensagemLidaRepository extends JpaRepository<MensagemLida, MensagemLidaId> {

    boolean existsByMensagemIdAndDadosPessoaisId(Long mensagemId, Long dadosPessoaisId);
}
