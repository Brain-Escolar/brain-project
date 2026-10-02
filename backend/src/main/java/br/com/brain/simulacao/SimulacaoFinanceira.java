package br.com.brain.simulacao;

import br.com.brain.aluno.Aluno;
import br.com.brain.crm.ProcessoMatricula;
import br.com.brain.enums.StatusSimulacaoFinanceira;
import br.com.brain.enums.Turno;
import br.com.brain.responsavel.Responsavel;
import br.com.brain.serie.Serie;
import br.com.brain.shared.EntidadeBase;
import br.com.brain.unidade.Unidade;
import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.envers.Audited;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * O calculo de quanto a familia vai pagar, feito uma vez e reaproveitado por
 * quatro telas: a proposta ao lead no CRM, o carne simulado, os titulos reais e
 * a tela de financeiro do responsavel. Se cada uma fizesse a sua conta,
 * divergiriam em tres meses.
 *
 * Enquanto RESERVADA ela segura orcamento de bolsa. A efetivacao da matricula
 * MATERIALIZA a simulacao em contrato + titulos, sem recalcular nada: o preco
 * que o pai viu na proposta e o preco que vai no boleto.
 */
@Entity
@Audited
@Table(name = "simulacoes_financeiras")
@Data
@EqualsAndHashCode(callSuper = false)
public class SimulacaoFinanceira extends EntidadeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processo_matricula_id", referencedColumnName = "id")
    private ProcessoMatricula processoMatricula;

    /** Lead ainda nao tem aluno; rematricula ja tem. O CHECK exige um dos dois. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aluno_id", referencedColumnName = "id")
    private Aluno aluno;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsavel_id", referencedColumnName = "id")
    private Responsavel responsavel;

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

    @Column(name = "qtd_parcelas")
    private Integer qtdParcelas;

    @Column(name = "dia_vencimento")
    private Integer diaVencimento;

    @Column(name = "valor_bruto")
    private BigDecimal valorBruto;

    @Column(name = "valor_desconto")
    private BigDecimal valorDesconto = BigDecimal.ZERO;

    @Column(name = "valor_liquido")
    private BigDecimal valorLiquido;

    @Enumerated(EnumType.STRING)
    private StatusSimulacaoFinanceira status = StatusSimulacaoFinanceira.RASCUNHO;

    /** Ate quando a proposta segura orcamento. Depois disso o job devolve. */
    @Column(name = "reserva_expira_em")
    private Instant reservaExpiraEm;

    /** Sem entidade: contratos_servico e da proxima fatia. */
    @Column(name = "contrato_id")
    private Long contratoId;

    @OneToMany(mappedBy = "simulacao", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SimulacaoItem> itens = new ArrayList<>();

    public void adicionarItem(SimulacaoItem item) {
        item.setSimulacao(this);
        itens.add(item);
    }

    /**
     * Mantem valor_liquido coerente com o CHECK do banco
     * (valor_liquido = valor_bruto - valor_desconto). Quem mexe no desconto
     * chama isto; nao ha caminho em que os dois andem separados.
     */
    public void aplicarDesconto(BigDecimal desconto) {
        this.valorDesconto = desconto;
        this.valorLiquido = valorBruto.subtract(desconto);
    }
}
