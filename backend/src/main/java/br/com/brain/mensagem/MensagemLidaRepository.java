package br.com.brain.mensagem;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MensagemLidaRepository extends JpaRepository<MensagemLida, MensagemLidaId> {

    boolean existsByMensagemIdAndDadosPessoaisId(Long mensagemId, Long dadosPessoaisId);
}
