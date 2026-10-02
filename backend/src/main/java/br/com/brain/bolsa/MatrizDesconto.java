package br.com.brain.bolsa;

import br.com.brain.serie.Serie;
import br.com.brain.shared.EntidadeBase;
import br.com.brain.unidade.Unidade;
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
import java.time.LocalDate;

/**
 * A matriz de descontos: ate quanto cada tipo de bolsa pode chegar, por serie e
 * unidade. Serie ou unidade nulas significam "vale para qualquer"; a regra mais
 * especifica vence (serie > unidade > geral).
 */
@Entity
@Audited
@Table(name = "matrizes_desconto")
@Data
@EqualsAndHashCode(callSuper = false)
public class MatrizDesconto extends EntidadeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "politica_id", referencedColumnName = "id")
    private PoliticaBolsa politica;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tipo_bolsa_id", referencedColumnName = "id")
    private TipoBolsa tipoBolsa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unidade_id", referencedColumnName = "id")
    private Unidade unidade;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "serie_id", referencedColumnName = "id")
    private Serie serie;

    @Column(name = "percentual_max")
    private BigDecimal percentualMax;

    @Column(name = "vigencia_inicio")
    private LocalDate vigenciaInicio;

    @Column(name = "vigencia_fim")
    private LocalDate vigenciaFim;

    /**
     * Quanto mais dimensoes preenchidas, mais especifica a regra. Usado para
     * desempatar quando varias linhas casam com o mesmo aluno.
     */
    public int especificidade() {
        int peso = 0;
        if (serie != null) {
            peso += 2;
        }
        if (unidade != null) {
            peso += 1;
        }
        return peso;
    }
}
