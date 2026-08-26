package br.com.brain.produto;

import java.math.BigDecimal;

import org.hibernate.envers.Audited;

import br.com.brain.shared.EntidadeBase;
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

@Entity
@Audited
@Table(name = "produtos_modalidades")
@Data
@EqualsAndHashCode(callSuper = false)
public class ProdutoModalidade extends EntidadeBase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produto_id", referencedColumnName = "id")
    private Produto produto;

    private String modalidade;

    private BigDecimal valor;

    private Boolean ativo = true;
}
