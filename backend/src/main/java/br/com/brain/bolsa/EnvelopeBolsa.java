package br.com.brain.bolsa;

import br.com.brain.enums.BaseCalculoEnvelope;
import br.com.brain.enums.NaturezaEnvelope;
import br.com.brain.enums.UnidadeMedidaEnvelope;
import br.com.brain.serie.Serie;
import br.com.brain.shared.EntidadeBase;
import br.com.brain.unidade.Unidade;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.envers.Audited;

import java.math.BigDecimal;

/**
 * Orcamento de bolsa. LIMITE_MAXIMO e teto comercial; META_MINIMA e piso
 * filantropico (CEBAS). Mesmas colunas, muda so o sentido da comparacao.
 * Escopo todo nulo = envelope global do ano letivo.
 */
@Entity
@Audited
@Table(name = "envelopes_bolsa")
@Data
@EqualsAndHashCode(callSuper = false)
public class EnvelopeBolsa extends EntidadeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "politica_id", referencedColumnName = "id")
    private PoliticaBolsa politica;

    private String nome;

    @Enumerated(EnumType.STRING)
    private NaturezaEnvelope natureza;

    @Enumerated(EnumType.STRING)
    @Column(name = "unidade_medida")
    private UnidadeMedidaEnvelope unidadeMedida;

    @Column(name = "valor_limite")
    private BigDecimal valorLimite;

    @Column(name = "percentual_limite")
    private BigDecimal percentualLimite;

    @Column(name = "quantidade_limite")
    private BigDecimal quantidadeLimite;

    @Enumerated(EnumType.STRING)
    @Column(name = "base_calculo")
    private BaseCalculoEnvelope baseCalculo;

    @Column(name = "receita_projetada")
    private BigDecimal receitaProjetada;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unidade_id", referencedColumnName = "id")
    private Unidade unidade;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "serie_id", referencedColumnName = "id")
    private Serie serie;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tipo_bolsa_id", referencedColumnName = "id")
    private TipoBolsa tipoBolsa;

    @Column(name = "permite_excedente")
    private Boolean permiteExcedente = true;

    private Boolean ativo = true;

    /**
     * Cache do consumo. A verdade e movimentos_envelope; estas colunas existem
     * para a tela nao varrer o razao a cada tecla, e sao atualizadas na mesma
     * transacao do movimento, sob lock pessimista.
     */
    private BigDecimal reservado = BigDecimal.ZERO;

    private BigDecimal comprometido = BigDecimal.ZERO;

    @Column(name = "reservado_equiv")
    private BigDecimal reservadoEquiv = BigDecimal.ZERO;

    @Column(name = "comprometido_equiv")
    private BigDecimal comprometidoEquiv = BigDecimal.ZERO;

    public BigDecimal consumido() {
        return reservado.add(comprometido);
    }

    public BigDecimal consumidoEquivalente() {
        return reservadoEquiv.add(comprometidoEquiv);
    }
}
