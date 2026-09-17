package br.com.brain.simulacao;

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
 * Uma linha da proposta. Guarda o preco copiado, nao so a referencia: se a
 * tabela de precos mudar em outubro, a proposta feita em setembro continua
 * valendo o que foi prometido.
 */
@Entity
@Audited
@Table(name = "simulacoes_itens")
@Data
@EqualsAndHashCode(callSuper = false, onlyExplicitlyIncluded = true)
public class SimulacaoItem extends EntidadeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    /** ToString e equals cortados aqui: a volta filho->pai daria recursao. */
    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "simulacao_id", referencedColumnName = "id")
    private SimulacaoFinanceira simulacao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produto_modalidade_id", referencedColumnName = "id")
    private ProdutoModalidade modalidade;

    /**
     * Qual linha da tabela deu origem ao preco. Fica nulo se o preco for
     * apagado depois (ON DELETE SET NULL) -- o valor copiado sobrevive.
     *
     * @NotAudited e obrigatorio, nao preferencia: ProdutoPreco esta fora da
     * auditoria de proposito (a tabela ja e temporal), e o Envers recusa subir
     * quando uma entidade auditada aponta para uma que nao e. Sem isto, o
     * contexto do Spring nao carrega -- e o erro so aparece no boot.
     *
     * Nao se perde nada: o valor do preco esta copiado em valor_unitario, que e
     * auditado.
     */
    @NotAudited
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produto_preco_id", referencedColumnName = "id")
    private ProdutoPreco preco;

    private String descricao;

    @Column(name = "valor_unitario")
    private BigDecimal valorUnitario;

    private Integer quantidade = 1;

    /** Se a bolsa incide sobre esta linha. Taxa de material normalmente nao. */
    @Column(name = "elegivel_bolsa")
    private Boolean elegivelBolsa = false;

    public BigDecimal total() {
        return valorUnitario.multiply(BigDecimal.valueOf(quantidade));
    }
}
