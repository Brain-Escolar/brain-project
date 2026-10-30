package br.com.brain.contrato;

import br.com.brain.enums.StatusContratoServico;
import br.com.brain.matricula.Matricula;
import br.com.brain.responsavel.Responsavel;
import br.com.brain.shared.EntidadeBase;
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
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * O contrato de prestacao de servico: quanto a familia deve pelo ano letivo.
 *
 * Nasce MATERIALIZADO a partir da simulacao, sem recalcular nada. O preco que o
 * pai viu na proposta e o preco que vai no contrato -- e por isso os itens
 * guardam valor copiado, nao FK viva para a tabela de precos. Quando 2028 entrar
 * na tabela, o contrato de 2027 continua sabendo o que foi combinado.
 *
 * `responsavel_id` e o titular do contrato. O rateio entre responsaveis acontece
 * nos TITULOS, nao aqui: o contrato tem um dono, a conta pode ser dividida.
 */
@Entity
@Audited
@Table(name = "contratos_servico")
@Data
@EqualsAndHashCode(callSuper = false)
public class ContratoServico extends EntidadeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "matricula_id", referencedColumnName = "id")
    private Matricula matricula;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsavel_id", referencedColumnName = "id")
    private Responsavel responsavel;

    /** Unico no banco. E o que a familia cita ao ligar. */
    private String numero;

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
    private StatusContratoServico status;

    /**
     * VIGENTE e o que entra na receita realizada do envelope percentual. Um
     * contrato em RASCUNHO nao aumenta o denominador do teto de bolsa.
     */
    @Column(name = "data_inicio")
    private LocalDate dataInicio;

    @Column(name = "data_fim")
    private LocalDate dataFim;

    @OneToMany(mappedBy = "contrato", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ContratoItem> itens = new ArrayList<>();

    public void adicionarItem(ContratoItem item) {
        item.setContrato(this);
        itens.add(item);
    }

    /**
     * Mantem o CHECK do banco de pe (valor_liquido = bruto - desconto). Quem mexe
     * num dos dois passa por aqui; nao ha caminho em que andem separados.
     */
    public void definirValores(BigDecimal bruto, BigDecimal desconto) {
        this.valorBruto = bruto;
        this.valorDesconto = desconto;
        this.valorLiquido = bruto.subtract(desconto);
    }
}
