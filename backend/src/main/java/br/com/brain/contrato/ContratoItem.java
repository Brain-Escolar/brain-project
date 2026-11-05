package br.com.brain.contrato;

import br.com.brain.enums.NaturezaProduto;
import br.com.brain.produto.ProdutoModalidade;
import br.com.brain.produto.ProdutoPreco;
import br.com.brain.shared.EntidadeBase;
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

    /**
     * Snapshot da natureza do produto no fechamento, como descricao e
     * valorUnitario ja sao.
     *
     * E ela que decide quantos titulos este item gera: RECORRENTE gera um por
     * competencia do contrato, UNICO e EVENTUAL geram um so. Congelada aqui
     * porque, se o produto mudar de natureza no catalogo no ano que vem, o
     * contrato deste ano tem de continuar explicando o carne que emitiu.
     */
    @Enumerated(EnumType.STRING)
    private NaturezaProduto natureza;

    /**
     * Quanto da bolsa do contrato caiu NESTE item.
     *
     * O contrato guarda o total; isto diz onde ele pousou. Sem a conta por item,
     * a bolsa ficaria diluida em todos os produtos -- inclusive nos que nao sao
     * elegiveis -- e a familia veria desconto no seguro escolar, que nunca teve
     * desconto nenhum.
     */
    @Column(name = "valor_desconto")
    private BigDecimal valorDesconto = BigDecimal.ZERO;

    public BigDecimal total() {
        return valorUnitario.multiply(BigDecimal.valueOf(quantidade));
    }

    /** O que a familia paga por este item no ano, ja com a bolsa aplicada. */
    public BigDecimal totalLiquido() {
        return total().subtract(valorDesconto == null ? BigDecimal.ZERO : valorDesconto);
    }

    /**
     * Quantos titulos este item gera. Produto de cobranca unica nao vira carne:
     * taxa de matricula e material sao cobrados de uma vez, na primeira
     * competencia.
     */
    public int quantidadeDeTitulos(int parcelasDoContrato) {
        return natureza == NaturezaProduto.RECORRENTE ? parcelasDoContrato : 1;
    }
}
