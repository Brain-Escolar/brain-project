package br.com.brain.contrato;

import br.com.brain.produto.ProdutoModalidade;
import br.com.brain.produto.ProdutoPreco;
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
import lombok.ToString;
import org.hibernate.envers.Audited;
import org.hibernate.envers.NotAudited;

import java.math.BigDecimal;

/**
 * Uma linha do contrato. `descricao` e `valor_unitario` sao SNAPSHOT: o contrato
 * e o documento do que foi combinado, e precisa continuar legivel mesmo depois
 * que o produto for renomeado ou o preco mudar.
 */
@Entity
@Audited
@Table(name = "contratos_itens")
@Data
@EqualsAndHashCode(callSuper = false, onlyExplicitlyIncluded = true)
public class ContratoItem extends EntidadeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    /** ToString cortado: a volta filho->pai daria recursao. */
    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contrato_id", referencedColumnName = "id")
    private ContratoServico contrato;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produto_modalidade_id", referencedColumnName = "id")
    private ProdutoModalidade modalidade;

    /**
     * Rastro da origem, nao fonte do valor. Fica nulo se o preco de catalogo for
     * apagado (ON DELETE SET NULL) -- o valor copiado sobrevive.
     *
     * @NotAudited e obrigatorio: ProdutoPreco esta fora da auditoria de proposito,
     * e o Envers recusa subir quando entidade auditada aponta para uma que nao e.
     */
    @NotAudited
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produto_preco_id", referencedColumnName = "id")
    private ProdutoPreco preco;

    private String descricao;

    @Column(name = "valor_unitario")
    private BigDecimal valorUnitario;

    private Integer quantidade = 1;

    /** Se a bolsa incide sobre esta linha. Material normalmente nao. */
    @Column(name = "elegivel_bolsa")
    private Boolean elegivelBolsa = false;

    public BigDecimal total() {
        return valorUnitario.multiply(BigDecimal.valueOf(quantidade));
    }
}
