package br.com.brain.contrato;

import br.com.brain.enums.StatusTitulo;
import br.com.brain.responsavel.Responsavel;
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
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.envers.Audited;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Uma parcela: conta a receber.
 *
 * O VALOR e imutavel -- nao ha setter para bruto, desconto ou liquido. Corrigir
 * uma parcela se faz estornando ou renegociando e emitindo outra, nunca
 * reescrevendo: um titulo que muda de valor depois de emitido destroi a
 * conciliacao, porque o extrato do banco continua mostrando o valor antigo.
 *
 * O STATUS muda, e so pelos metodos nomeados daqui. Isso deixa as transicoes
 * legiveis num lugar so, em vez de espalhadas em setStatus pelo sistema.
 *
 * Bruto e desconto ficam SEPARADOS de proposito: e o que permite ao responsavel
 * ver "mensalidade 1.350, bolsa -270, a pagar 1.080" em vez de so o liquido. Sem
 * isso a bolsa fica invisivel para quem a recebeu.
 */
@Entity
@Audited
@Table(name = "titulos")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(callSuper = false, onlyExplicitlyIncluded = true)
public class Titulo extends EntidadeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contrato_id", referencedColumnName = "id")
    private ContratoServico contrato;

    /**
     * Quem paga ESTA parcela. Pode nao ser o titular do contrato: o rateio entre
     * responsaveis acontece aqui, e o indice unico do banco e
     * (contrato, numero_parcela, responsavel) justamente para permitir isso.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsavel_id", referencedColumnName = "id")
    private Responsavel responsavel;

    /**
     * Mes de referencia, sempre no dia 1 -- o banco cobra isso com CHECK.
     * Competencia e vencimento sao coisas diferentes: a parcela de fevereiro pode
     * vencer em marco, e o relatorio de receita olha a competencia.
     */
    private LocalDate competencia;

    @Column(name = "numero_parcela")
    private Integer numeroParcela;

    private LocalDate vencimento;

    private String descricao;

    @Column(name = "valor_bruto")
    private BigDecimal valorBruto;

    @Column(name = "valor_desconto")
    private BigDecimal valorDesconto;

    @Column(name = "valor_liquido")
    private BigDecimal valorLiquido;

    @Enumerated(EnumType.STRING)
    private StatusTitulo status;

    /** Preenchido no titulo NOVO, apontando para o que ele substituiu. */
    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "titulo_origem_id", referencedColumnName = "id")
    private Titulo tituloOrigem;

    private Titulo(ContratoServico contrato, Responsavel responsavel, LocalDate competencia,
            Integer numeroParcela, LocalDate vencimento, String descricao,
            BigDecimal valorBruto, BigDecimal valorDesconto, Titulo tituloOrigem) {
        this.contrato = contrato;
        this.responsavel = responsavel;
        // Normaliza para o dia 1: o CHECK do banco exige, e deixar o chamador
        // lembrar disso seria erro esperando acontecer.
        this.competencia = competencia.withDayOfMonth(1);
        this.numeroParcela = numeroParcela;
        this.vencimento = vencimento;
        this.descricao = descricao;
        this.valorBruto = valorBruto;
        this.valorDesconto = valorDesconto;
        this.valorLiquido = valorBruto.subtract(valorDesconto);
        this.status = StatusTitulo.ABERTO;
        this.tituloOrigem = tituloOrigem;
    }

    public static Titulo parcela(ContratoServico contrato, Responsavel responsavel,
            LocalDate competencia, int numeroParcela, LocalDate vencimento, String descricao,
            BigDecimal valorBruto, BigDecimal valorDesconto) {
        return new Titulo(contrato, responsavel, competencia, numeroParcela, vencimento,
                descricao, valorBruto, valorDesconto, null);
    }

    /** Substitui um titulo existente, mantendo o rastro de onde veio. */
    public static Titulo substituindo(Titulo origem, LocalDate vencimento,
            BigDecimal valorBruto, BigDecimal valorDesconto, String descricao) {
        return new Titulo(origem.getContrato(), origem.getResponsavel(), origem.getCompetencia(),
                origem.getNumeroParcela(), vencimento, descricao, valorBruto, valorDesconto, origem);
    }

    // --------------------------------------------------------------- transicoes

    public void pagar() {
        exigirAberto("baixar");
        this.status = StatusTitulo.PAGO;
    }

    public void cancelar() {
        exigirAberto("cancelar");
        this.status = StatusTitulo.CANCELADO;
    }

    /**
     * Baixa revertida. Vai para ESTORNADO e NAO volta para ABERTO: voltar
     * apagaria o fato de que houve um pagamento, e o extrato do banco continuaria
     * mostrando a entrada. Se a divida persiste, emite-se outro titulo.
     */
    public void estornar() {
        if (status != StatusTitulo.PAGO) {
            throw new IllegalStateException(
                    "Só um título PAGO pode ser estornado; este está " + status + ".");
        }
        this.status = StatusTitulo.ESTORNADO;
    }

    public void marcarRenegociado() {
        exigirAberto("renegociar");
        this.status = StatusTitulo.RENEGOCIADO;
    }

    public boolean estaAberto() {
        return status == StatusTitulo.ABERTO;
    }

    private void exigirAberto(String acao) {
        if (status != StatusTitulo.ABERTO) {
            throw new IllegalStateException(
                    "Só é possível " + acao + " um título ABERTO; este está " + status + ".");
        }
    }
}
