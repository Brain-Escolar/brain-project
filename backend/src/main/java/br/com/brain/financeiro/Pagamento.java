package br.com.brain.financeiro;

import br.com.brain.contrato.Titulo;
import br.com.brain.enums.FormaPagamento;
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
import java.time.Instant;
import java.time.LocalDate;

/**
 * A baixa: o registro de que a parcela entrou.
 *
 * Como o titulo, nasce com os valores fechados e nao tem setter para eles. O
 * unico fato que pode acontecer depois e o estorno, e ele nao apaga a linha --
 * marca. Quem fechou o caixa de ontem tem de continuar vendo que houve uma baixa
 * e que ela foi desfeita, por quem e por que; apagar deixaria o relatorio de
 * ontem diferente do de hoje sem nada explicando.
 *
 * `registradoPorId` e `estornadoPorId` sao Long cru, e nao associacao com
 * DadosPessoais, de proposito: a entidade nao precisa navegar para o operador em
 * lugar nenhum, e associacao LAZY aqui so renderia uma consulta extra por linha
 * no relatorio de caixa. O nome, quando a tela precisa, o servico resolve de uma
 * vez para todos os operadores da pagina.
 */
@Entity
@Audited
@Table(name = "pagamentos")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(callSuper = false, onlyExplicitlyIncluded = true)
public class Pagamento extends EntidadeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "titulo_id", referencedColumnName = "id")
    private Titulo titulo;

    /**
     * Pode ser MAIOR que o liquido do titulo (juros, multa). Menor nao -- a regra
     * mora em BaixaTituloService, porque aceitar menos deixaria um saldo que
     * nenhum relatorio cobra.
     */
    @Column(name = "valor_pago")
    private BigDecimal valorPago;

    /**
     * Quando o dinheiro entrou, nao quando foi lancado. A secretaria lanca na
     * segunda o Pix que caiu no sabado, e o caixa do sabado tem de fechar.
     */
    @Column(name = "data_pagamento")
    private LocalDate dataPagamento;

    @Enumerated(EnumType.STRING)
    private FormaPagamento forma;

    @Column(name = "registrado_por_id")
    private Long registradoPorId;

    private String observacao;

    @Column(name = "estornado_em")
    private Instant estornadoEm;

    @Column(name = "estornado_por_id")
    private Long estornadoPorId;

    @Column(name = "motivo_estorno")
    private String motivoEstorno;

    private Pagamento(Titulo titulo, BigDecimal valorPago, LocalDate dataPagamento,
            FormaPagamento forma, Long registradoPorId, String observacao) {
        this.titulo = titulo;
        this.valorPago = valorPago;
        this.dataPagamento = dataPagamento;
        this.forma = forma;
        this.registradoPorId = registradoPorId;
        this.observacao = observacao;
    }

    public static Pagamento registrar(Titulo titulo, BigDecimal valorPago, LocalDate dataPagamento,
            FormaPagamento forma, Long registradoPorId, String observacao) {
        return new Pagamento(titulo, valorPago, dataPagamento, forma, registradoPorId, observacao);
    }

    /**
     * Desfaz a baixa. Os tres campos andam juntos porque o banco exige (CHECK
     * chk_pagamentos_estorno): estorno sem autor ou sem motivo e um registro que
     * ninguem consegue auditar depois.
     */
    public void estornar(Long operadorId, String motivo) {
        if (!estaVivo()) {
            throw new IllegalStateException("Este pagamento já foi estornado em " + estornadoEm + ".");
        }
        if (operadorId == null) {
            throw new IllegalArgumentException("Estorno exige o operador.");
        }
        if (motivo == null || motivo.isBlank()) {
            throw new IllegalArgumentException("Estorno exige motivo.");
        }
        this.estornadoEm = Instant.now();
        this.estornadoPorId = operadorId;
        this.motivoEstorno = motivo.strip();
    }

    /** Baixa que ainda vale. Pagamento estornado nao conta no caixa nem na receita. */
    public boolean estaVivo() {
        return estornadoEm == null;
    }
}
