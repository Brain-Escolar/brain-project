package br.com.brain.bolsa;

import br.com.brain.dadosPessoais.DadosPessoais;
import br.com.brain.enums.StatusConcessaoBolsa;
import br.com.brain.shared.EntidadeBase;
import br.com.brain.simulacao.SimulacaoFinanceira;
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
import org.hibernate.envers.Audited;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

/**
 * Uma bolsa concedida a um aluno. E o documento; quem mexe no saldo do
 * orcamento e o razao (movimentos_envelope), sempre apontando para ca.
 *
 * O ciclo de vida e o que faz o orcamento fechar:
 *
 *   SIMULADA  -> calculada na tela, nao segura nada
 *   RESERVADA -> proposta entregue ao lead, segura orcamento ate vencer
 *   ATIVA     -> matricula efetivada, consome o ano letivo
 *   ENCERRADA -> saiu no meio do ano, devolve a parte nao realizada
 *   CANCELADA -> lead perdido ou reserva vencida, devolve tudo
 *
 * Nenhuma dessas transicoes mexe no saldo direto: cada uma gera movimento.
 */
@Entity
@Audited
@Table(name = "concessoes_bolsa")
@Data
@EqualsAndHashCode(callSuper = false)
public class ConcessaoBolsa extends EntidadeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tipo_bolsa_id", referencedColumnName = "id")
    private TipoBolsa tipoBolsa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "simulacao_id", referencedColumnName = "id")
    private SimulacaoFinanceira simulacao;

    /**
     * Sem entidade porque contratos_servico ainda nao tem uma (proxima fatia).
     * A coluna e FK no banco; aqui e so o id.
     */
    @Column(name = "contrato_id")
    private Long contratoId;

    private BigDecimal percentual;

    /**
     * O que foi PEDIDO, ao lado do que vale.
     *
     * Os dois juntos sao a historia da negociacao: "pediu 30, saiu 25" diz muito
     * mais do que "25", e e o que a direcao olha para calibrar a matriz no ano
     * seguinte. Guardar so o aprovado apagaria metade do fato.
     */
    @Column(name = "percentual_pedido")
    private BigDecimal percentualPedido;

    /** O que a escola deixa de arrecadar no ano por causa desta bolsa. */
    @Column(name = "valor_renuncia_anual")
    private BigDecimal valorRenunciaAnual;

    /** 1.00 = uma bolsa integral, 0.50 = meia. E assim que o CEBAS conta. */
    @Column(name = "equivalente_bolsa")
    private BigDecimal equivalenteBolsa;

    @Enumerated(EnumType.STRING)
    private StatusConcessaoBolsa status;

    @Column(name = "vigencia_inicio")
    private LocalDate vigenciaInicio;

    @Column(name = "vigencia_fim")
    private LocalDate vigenciaFim;

    private String motivo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "solicitado_por", referencedColumnName = "id")
    private DadosPessoais solicitadoPor;

    /**
     * Coluna propria em vez de consulta ao Envers: o relatorio de bolsa agrega
     * por aprovador, e isso nao se faz sobre tabela de auditoria.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aprovado_por", referencedColumnName = "id")
    private DadosPessoais aprovadoPor;

    @Column(name = "aprovado_em")
    private Instant aprovadoEm;

    /** Concedida acima do que o envelope comportava, com aprovacao registrada. */
    @Column(name = "excedeu_envelope")
    private Boolean excedeuEnvelope = false;

    /** Por que aprovou, aprovou menos, ou recusou. */
    @Column(name = "motivo_decisao")
    private String motivoDecisao;

    public boolean seguraOrcamento() {
        return status == StatusConcessaoBolsa.RESERVADA || status == StatusConcessaoBolsa.ATIVA;
    }

    /**
     * Pendente NAO segura orcamento, mas ocupa a vaga do tipo de bolsa na
     * proposta: sem isto, daria para pedir a mesma bolsa duas vezes enquanto a
     * primeira espera a direcao, e aprovar as duas.
     */
    public boolean ocupaOTipoDeBolsa() {
        return seguraOrcamento() || status == StatusConcessaoBolsa.PENDENTE_APROVACAO;
    }

    public boolean estaPendente() {
        return status == StatusConcessaoBolsa.PENDENTE_APROVACAO;
    }
}
