package br.com.brain.bolsa;

import br.com.brain.perfil.Perfil;
import br.com.brain.shared.EntidadeBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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

/** Ate quanto cada perfil pode conceder sem escalar. */
@Entity
@Audited
@Table(name = "alcadas_desconto")
@Data
@EqualsAndHashCode(callSuper = false)
public class AlcadaDesconto extends EntidadeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "politica_id", referencedColumnName = "id")
    private PoliticaBolsa politica;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "perfil_id", referencedColumnName = "id")
    private Perfil perfil;

    @Column(name = "percentual_max")
    private BigDecimal percentualMax;

    /**
     * Quem pode autorizar concessao que estoura o orcamento. Furar a alcada
     * bloqueia e escala; furar o envelope avisa e exige este aval.
     */
    @Column(name = "pode_exceder_envelope")
    private Boolean podeExcederEnvelope = false;
}
