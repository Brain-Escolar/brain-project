package br.com.brain.bolsa;

import br.com.brain.produto.Produto;
import br.com.brain.shared.EntidadeBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.envers.Audited;
import org.hibernate.envers.NotAudited;

import java.util.ArrayList;
import java.util.List;

@Entity
@Audited
@Table(name = "tipos_bolsa")
@Data
@EqualsAndHashCode(callSuper = false)
public class TipoBolsa extends EntidadeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String codigo;

    private String nome;

    /**
     * true  = renuncia planejada (social, irmao, funcionario): consome envelope.
     * false = incentivo condicional (pontualidade): NAO consome. Juntar os dois
     * infla o numero da renuncia e o torna inutil para decidir.
     */
    private Boolean estrutural;

    @Column(name = "exige_comprovacao")
    private Boolean exigeComprovacao = false;

    @Column(name = "conta_para_cebas")
    private Boolean contaParaCebas = false;

    @Column(name = "acumula_com_outras")
    private Boolean acumulaComOutras = true;

    private Boolean ativo = true;

    /** Sobre quais itens esta bolsa incide: mensalidade sim, passeio nao. */
    @NotAudited
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "tipos_bolsa_produtos", joinColumns = @JoinColumn(name = "tipo_bolsa_id"), inverseJoinColumns = @JoinColumn(name = "produto_id"))
    private List<Produto> produtos = new ArrayList<>();
}
