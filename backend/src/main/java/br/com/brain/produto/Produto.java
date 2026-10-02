package br.com.brain.produto;

import java.util.List;

import org.hibernate.envers.Audited;
import org.hibernate.envers.NotAudited;

import br.com.brain.enums.NaturezaProduto;
import br.com.brain.shared.EntidadeBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Audited
@Table(name = "produtos")
@Data
@EqualsAndHashCode(callSuper = false)
public class Produto extends EntidadeBase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    private String descricao;

    private Boolean ativo = true;

    /** RECORRENTE (mensalidade) | UNICO (taxa de matricula) | EVENTUAL (passeio). */
    @Enumerated(EnumType.STRING)
    private NaturezaProduto natureza;

    /** Se bolsa pode incidir sobre este item. Ver tambem TipoBolsa.produtos. */
    @Column(name = "permite_bolsa")
    private Boolean permiteBolsa = false;

    @Column(name = "gera_nfse")
    private Boolean geraNfse = true;

    /** Item da LC 116/2003; ensino e 8.01. Usado pela NFS-e. */
    @Column(name = "item_lc116")
    private String itemLc116;

    /** Ponte para o plano de contas do DRE. */
    @Column(name = "conta_contabil")
    private String contaContabil;

    @NotAudited
    @OneToMany(mappedBy = "produto", fetch = FetchType.LAZY)
    private List<ProdutoModalidade> modalidades;
}
