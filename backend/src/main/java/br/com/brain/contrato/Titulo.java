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
     * (contrato, numero_parcela, responsavel, versao) justamente para permitir
     * isso.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsavel_id", referencedColumnName = "id")
    private Responsavel responsavel;

    /**
     * QUAL item do contrato este titulo cobra.
     *
     * E a mudanca que separa "parcela 3 do contrato" de "parcela 3 da
     * mensalidade" e "parcela 3 do seguro". Sem isto, servico contratado no meio
     * do ano nao teria onde emitir, e um titulo que mistura mensalidade e
     * material nao teria como ter um emitente so.
     */
    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contrato_item_id", referencedColumnName = "id")
    private ContratoItem contratoItem;

    /**
     * Mes de referencia, sempre no dia 1 -- o banco cobra isso com CHECK.
     * Competencia e vencimento sao coisas diferentes: a parcela de fevereiro pode
     * vencer em marco, e o relatorio de receita olha a competencia.
     */
    private LocalDate competencia;

    @Column(name = "numero_parcela")
    private Integer numeroParcela;

    /**
     * Qual tentativa desta parcela esta linha e: 1 na emissao do carne, 2 depois
     * de um estorno ou renegociacao com reemissao, e assim por diante.
     *
     * Faz parte da chave unica. Sem ela, o titulo substituto colidiria com o
     * substituido em (contrato, parcela, responsavel) e a correcao seria
     * impossivel -- ver V112.
     */
    private Integer versao;

    private LocalDate vencimento;

    /**
     * O vencimento com que o titulo nasceu. Nao muda nunca.
     *
     * Existe para adiar uma parcela sem perder de vista que ela era de novembro:
     * a familia ve "vencimento original Nov/2026, vence 10/12/2026", e o
     * relatorio de inadimplencia continua sabendo ha quanto tempo a divida e
     * velha de verdade. Sem isto, adiar obrigaria a emitir titulo novo so para
     * trocar uma data.
     */
    @Column(name = "vencimento_original")
    private LocalDate vencimentoOriginal;

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

    private Titulo(ContratoServico contrato, ContratoItem contratoItem, Responsavel responsavel,
            LocalDate competencia, Integer numeroParcela, LocalDate vencimento, String descricao,
            BigDecimal valorBruto, BigDecimal valorDesconto, Titulo tituloOrigem) {
        this.contrato = contrato;
        this.contratoItem = contratoItem;
        this.responsavel = responsavel;
        // Normaliza para o dia 1: o CHECK do banco exige, e deixar o chamador
        // lembrar disso seria erro esperando acontecer.
        this.competencia = competencia.withDayOfMonth(1);
        this.numeroParcela = numeroParcela;
        this.vencimento = vencimento;
        // O original atravessa a cadeia: reemitir nao apaga de que mes a parcela
        // era. Sem isto, um titulo reemitido tres vezes perderia a data que a
        // familia tem na cabeca.
        this.vencimentoOriginal = tituloOrigem == null
                ? vencimento
                : tituloOrigem.getVencimentoOriginal();
        this.descricao = descricao;
        this.valorBruto = valorBruto;
        this.valorDesconto = valorDesconto;
        this.valorLiquido = valorBruto.subtract(valorDesconto);
        this.status = StatusTitulo.ABERTO;
        this.tituloOrigem = tituloOrigem;
        this.versao = tituloOrigem == null ? 1 : tituloOrigem.getVersao() + 1;
    }

    public static Titulo parcela(ContratoServico contrato, ContratoItem contratoItem,
            Responsavel responsavel, LocalDate competencia, int numeroParcela,
            LocalDate vencimento, String descricao,
            BigDecimal valorBruto, BigDecimal valorDesconto) {
        return new Titulo(contrato, contratoItem, responsavel, competencia, numeroParcela,
                vencimento, descricao, valorBruto, valorDesconto, null);
    }

    /**
     * Substitui um titulo existente, mantendo o rastro de onde veio e subindo a
     * versao.
     *
     * O titulo de ORIGEM precisa ter saido de ABERTO antes (estornado, cancelado
     * ou renegociado): duas versoes abertas da mesma parcela cobrariam a familia
     * duas vezes, e o indice unico nao pega isso -- as versoes sao diferentes.
     */
    public static Titulo substituindo(Titulo origem, LocalDate vencimento,
            BigDecimal valorBruto, BigDecimal valorDesconto, String descricao) {
        if (origem.estaAberto()) {
            throw new IllegalStateException(
                    "O título de origem ainda está ABERTO. Estorne, cancele ou renegocie antes de"
                            + " reemitir, senão a parcela fica cobrada duas vezes.");
        }
        return new Titulo(origem.getContrato(), origem.getContratoItem(), origem.getResponsavel(),
                origem.getCompetencia(), origem.getNumeroParcela(), vencimento, descricao,
                valorBruto, valorDesconto, origem);
    }

    // --------------------------------------------------------------- transicoes

    /**
     * Adia o vencimento sem emitir titulo novo.
     *
     * O valor nao muda, entao nao ha motivo para outro documento -- e o original
     * fica guardado em vencimentoOriginal, para o relatorio continuar sabendo de
     * que mes a parcela era. So faz sentido em titulo ABERTO: adiar algo ja pago
     * nao quer dizer nada.
     */
    public void adiarPara(LocalDate novoVencimento) {
        exigirAberto("adiar");
        if (novoVencimento == null) {
            throw new IllegalArgumentException("Informe o novo vencimento.");
        }
        if (novoVencimento.isBefore(vencimentoOriginal)) {
            throw new IllegalStateException(
                    "O novo vencimento (" + novoVencimento + ") é anterior ao original ("
                            + vencimentoOriginal + "). Antecipar não é adiar: para cobrar antes,"
                            + " combine o pagamento com a família.");
        }
        this.vencimento = novoVencimento;
    }

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
