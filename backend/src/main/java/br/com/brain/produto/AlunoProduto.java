package br.com.brain.produto;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.hibernate.envers.Audited;

import br.com.brain.aluno.Aluno;
import br.com.brain.enums.StatusAlunoProduto;
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
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Audited
@Table(name = "alunos_produtos")
@Data
@EqualsAndHashCode(callSuper = false)
public class AlunoProduto extends EntidadeBase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aluno_id", referencedColumnName = "id")
    private Aluno aluno;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produto_modalidade_id", referencedColumnName = "id")
    private ProdutoModalidade produtoModalidade;

    private BigDecimal desconto = BigDecimal.ZERO;

    @Column(name = "valor_pago")
    private BigDecimal valorPago;

    @Column(name = "data_compra")
    private LocalDate dataCompra;

    @Enumerated(EnumType.STRING)
    private StatusAlunoProduto status = StatusAlunoProduto.ATIVO;
}
