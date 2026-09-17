package br.com.brain.bolsa;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

/**
 * Nao estende JpaRepository de proposito.
 *
 * JpaRepository traria delete(), deleteAll() e um save() que tambem atualiza --
 * e o razao e append-only. O que nao esta declarado aqui nao existe para o
 * resto do sistema, entao a regra para de depender de alguem lembrar dela.
 *
 * `registrar` e o unico caminho de escrita, e MovimentoEnvelope nao tem setter,
 * entao nem por acidente se atualiza uma linha ja gravada.
 */
public interface MovimentoEnvelopeRepository extends Repository<MovimentoEnvelope, Long> {

    MovimentoEnvelope save(MovimentoEnvelope movimento);

    List<MovimentoEnvelope> findByConcessaoIdOrderByIdAsc(Long concessaoId);

    /**
     * Saldo reservado segundo o razao. Existe para conferir o cache do envelope:
     * se divergir, o cache mentiu e o relatorio de renuncia sai errado.
     *
     * RESERVA soma positivo e LIBERACAO soma negativo, entao e so somar.
     */
    @Query("""
            SELECT COALESCE(SUM(m.valor), 0) FROM MovimentoEnvelope m
             WHERE m.envelope.id = :envelopeId
               AND m.tipo IN (br.com.brain.enums.TipoMovimentoEnvelope.RESERVA,
                              br.com.brain.enums.TipoMovimentoEnvelope.LIBERACAO)
            """)
    BigDecimal somarReservadoNoRazao(@Param("envelopeId") Long envelopeId);

    @Query("""
            SELECT COALESCE(SUM(m.valor), 0) FROM MovimentoEnvelope m
             WHERE m.envelope.id = :envelopeId
               AND m.tipo IN (br.com.brain.enums.TipoMovimentoEnvelope.COMPROMISSO,
                              br.com.brain.enums.TipoMovimentoEnvelope.ESTORNO,
                              br.com.brain.enums.TipoMovimentoEnvelope.AJUSTE)
            """)
    BigDecimal somarComprometidoNoRazao(@Param("envelopeId") Long envelopeId);
}
