package br.com.brain.bolsa;

import br.com.brain.enums.TipoMovimentoEnvelope;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Razao de consumo do orcamento de bolsa. E a fonte da verdade do saldo: as
 * colunas reservado/comprometido do envelope sao cache, atualizado na mesma
 * transacao e conferivel contra esta tabela.
 *
 * APPEND-ONLY. Nao ha setter, nao ha save de atualizacao e o repositorio nao
 * expoe delete. Correcao se faz com movimento novo de sinal oposto -- e o que
 * permite explicar, seis meses depois, por que o saldo e o que e.
 *
 * Nao estende EntidadeBase de proposito: a tabela nao tem atualizado_em, e com
 * ddl-auto=validate a heranca derrubaria o boot. Nao e @Audited tambem de
 * proposito: auditar um razao imutavel e guardar a mesma linha duas vezes.
 *
 * Uma concessao gera uma linha POR envelope atingido -- o global, o da serie e
 * o do tipo de bolsa sao tres linhas do mesmo movimento.
 */
@Entity
@Table(name = "movimentos_envelope")
@EntityListeners(AuditingEntityListener.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MovimentoEnvelope {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "envelope_id", referencedColumnName = "id")
    private EnvelopeBolsa envelope;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "concessao_id", referencedColumnName = "id")
    private ConcessaoBolsa concessao;

    @Enumerated(EnumType.STRING)
    private TipoMovimentoEnvelope tipo;

    /** Positivo consome, negativo devolve. O CHECK no banco cobra a coerencia. */
    private BigDecimal valor;

    @Column(name = "equivalente_bolsa")
    private BigDecimal equivalenteBolsa;

    /** So em RESERVA: depois disso o job devolve o que estava segurado. */
    @Column(name = "expira_em")
    private Instant expiraEm;

    @CreatedDate
    @Column(name = "criado_em", updatable = false)
    private Instant criadoEm;

    @CreatedBy
    @Column(name = "criado_por", updatable = false)
    private Long criadoPor;

    private MovimentoEnvelope(EnvelopeBolsa envelope, ConcessaoBolsa concessao,
            TipoMovimentoEnvelope tipo, BigDecimal valor, BigDecimal equivalenteBolsa,
            Instant expiraEm) {
        this.envelope = envelope;
        this.concessao = concessao;
        this.tipo = tipo;
        this.valor = valor;
        this.equivalenteBolsa = equivalenteBolsa;
        this.expiraEm = expiraEm;
    }

    /** Segura orcamento enquanto a proposta esta de pe. */
    public static MovimentoEnvelope reserva(EnvelopeBolsa envelope, ConcessaoBolsa concessao,
            BigDecimal valor, BigDecimal equivalente, Instant expiraEm) {
        return new MovimentoEnvelope(envelope, concessao, TipoMovimentoEnvelope.RESERVA,
                positivo(valor), positivo(equivalente), expiraEm);
    }

    /** Devolve o que a reserva segurava. */
    public static MovimentoEnvelope liberacao(EnvelopeBolsa envelope, ConcessaoBolsa concessao,
            BigDecimal valor, BigDecimal equivalente) {
        return new MovimentoEnvelope(envelope, concessao, TipoMovimentoEnvelope.LIBERACAO,
                negativo(valor), negativo(equivalente), null);
    }

    /** Matricula efetivada: o orcamento passa a estar gasto, nao segurado. */
    public static MovimentoEnvelope compromisso(EnvelopeBolsa envelope, ConcessaoBolsa concessao,
            BigDecimal valor, BigDecimal equivalente) {
        return new MovimentoEnvelope(envelope, concessao, TipoMovimentoEnvelope.COMPROMISSO,
                positivo(valor), positivo(equivalente), null);
    }

    /** Aluno saiu no meio do ano: devolve a parte que nao chegou a acontecer. */
    public static MovimentoEnvelope estorno(EnvelopeBolsa envelope, ConcessaoBolsa concessao,
            BigDecimal valor, BigDecimal equivalente) {
        return new MovimentoEnvelope(envelope, concessao, TipoMovimentoEnvelope.ESTORNO,
                negativo(valor), negativo(equivalente), null);
    }

    /** Correcao manual. Qualquer sinal; o motivo mora na concessao. */
    public static MovimentoEnvelope ajuste(EnvelopeBolsa envelope, ConcessaoBolsa concessao,
            BigDecimal valor, BigDecimal equivalente) {
        return new MovimentoEnvelope(envelope, concessao, TipoMovimentoEnvelope.AJUSTE,
                valor, equivalente, null);
    }

    private static BigDecimal positivo(BigDecimal valor) {
        return valor.abs();
    }

    private static BigDecimal negativo(BigDecimal valor) {
        return valor.abs().negate();
    }
}
