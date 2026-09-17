package br.com.brain.produto;

import br.com.brain.enums.Turno;
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

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Preco de uma modalidade por dimensao e vigencia. Ano letivo, unidade, serie ou
 * turno nulos significam "vale para qualquer"; a linha mais especifica vence.
 *
 * NAO e @Audited de proposito: a tabela ja e temporal (o historico esta nas
 * proprias linhas, via vigencia) e o delete vem por ON DELETE CASCADE da
 * modalidade, que nao passa pelo Hibernate e deixaria buraco na auditoria.
 *
 * A disciplina que substitui a auditoria: nunca editar `valor` no lugar.
 * Reajuste e fechar a vigencia da linha atual e inserir outra.
 */
@Entity
@Table(name = "produtos_precos")
@Data
@EqualsAndHashCode(callSuper = false)
public class ProdutoPreco extends EntidadeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produto_modalidade_id", referencedColumnName = "id")
    private ProdutoModalidade modalidade;

    @Column(name = "ano_letivo")
    private Integer anoLetivo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unidade_id", referencedColumnName = "id")
    private Unidade unidade;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "serie_id", referencedColumnName = "id")
    private Serie serie;

    @Enumerated(EnumType.STRING)
    private Turno turno;

    private BigDecimal valor;

    @Column(name = "vigencia_inicio")
    private LocalDate vigenciaInicio;

    @Column(name = "vigencia_fim")
    private LocalDate vigenciaFim;

    /** Quanto mais dimensoes preenchidas, mais especifica a linha. */
    public int especificidade() {
        int peso = 0;
        if (serie != null) {
            peso += 4;
        }
        if (turno != null) {
            peso += 2;
        }
        if (unidade != null) {
            peso += 1;
        }
        return peso;
    }
}
