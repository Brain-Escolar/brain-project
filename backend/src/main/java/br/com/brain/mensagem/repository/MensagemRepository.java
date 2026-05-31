package br.com.brain.mensagem.repository;
import br.com.brain.mensagem.models.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import br.com.brain.conversa.dto.ConversaNaoLidaContagem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MensagemRepository extends JpaRepository<Mensagem, Long> {

    Page<Mensagem> findByConversaId(Long conversaId, Pageable pageable);

    @Query("""
            SELECT m FROM Mensagem m
            WHERE m.conversa.id = :conversaId
            AND NOT EXISTS (
                SELECT ml FROM MensagemLida ml
                WHERE ml.mensagem.id = m.id
                AND ml.dadosPessoais.id = :dadosPessoaisId
            )
            """)
    List<Mensagem> findNaoLidasByConversaId(@Param("conversaId") Long conversaId, @Param("dadosPessoaisId") Long dadosPessoaisId);

    @Query("""
            SELECT COUNT(m) FROM Mensagem m
            WHERE m.conversa.id = :conversaId
            AND m.remetente.id != :dadosPessoaisId
            AND NOT EXISTS (
                SELECT ml FROM MensagemLida ml
                WHERE ml.mensagem.id = m.id
                AND ml.dadosPessoais.id = :dadosPessoaisId
            )
            """)
    long countNaoLidasByConversaId(@Param("conversaId") Long conversaId, @Param("dadosPessoaisId") Long dadosPessoaisId);

    @Query("""
            SELECT new br.com.brain.conversa.dto.ConversaNaoLidaContagem(m.conversa.id, COUNT(m.id))
            FROM Mensagem m
            WHERE m.conversa.id IN :conversaIds
            AND m.remetente.id != :dadosPessoaisId
            AND NOT EXISTS (
                SELECT ml FROM MensagemLida ml
                WHERE ml.mensagem.id = m.id
                AND ml.dadosPessoais.id = :dadosPessoaisId
            )
            GROUP BY m.conversa.id
            """)
    List<ConversaNaoLidaContagem> countNaoLidasGroupedByConversaId(@Param("conversaIds") List<Long> conversaIds, @Param("dadosPessoaisId") Long dadosPessoaisId);

    @Query("""
            SELECT COUNT(DISTINCT m.conversa.id) FROM Mensagem m
            WHERE m.conversa.remetente.id = :dadosPessoaisId
            AND m.remetente.id != :dadosPessoaisId
            AND NOT EXISTS (
                SELECT ml FROM MensagemLida ml
                WHERE ml.mensagem.id = m.id
                AND ml.dadosPessoais.id = :dadosPessoaisId
            )
            """)
    long countConversasComRespostaNaoLida(@Param("dadosPessoaisId") Long dadosPessoaisId);
}
