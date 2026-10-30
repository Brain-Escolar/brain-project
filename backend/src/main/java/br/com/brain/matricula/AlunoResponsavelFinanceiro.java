package br.com.brain.matricula;

import br.com.brain.aluno.Aluno;
import br.com.brain.responsavel.Responsavel;
import br.com.brain.shared.EntidadeBase;
import jakarta.persistence.Column;
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
import org.hibernate.envers.Audited;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Quem paga pelo aluno, e em que proporcao.
 *
 * Existe porque pai e mae separados dividem a mensalidade, e sem isto o sistema
 * so saberia cobrar de um. O rateio se materializa em titulos: cada parcela vira
 * um titulo por responsavel, e por isso o indice unico de titulos inclui o
 * responsavel.
 *
 * A vigencia importa: o acordo muda no meio do ano, e titulo ja emitido continua
 * valendo com o rateio de quando foi emitido.
 */
@Entity
@Audited
@Table(name = "alunos_responsaveis_financeiros")
@Data
@EqualsAndHashCode(callSuper = false)
public class AlunoResponsavelFinanceiro extends EntidadeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aluno_id", referencedColumnName = "id")
    private Aluno aluno;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsavel_id", referencedColumnName = "id")
    private Responsavel responsavel;

    /**
     * O titular do contrato, e quem absorve o centavo da divisao que nao fecha.
     * E uma escolha defensavel: quem responde pelo contrato responde pela sobra.
     */
    private Boolean principal = false;

    @Column(name = "percentual_rateio")
    private BigDecimal percentualRateio = new BigDecimal("100.00");

    @Column(name = "vigencia_inicio")
    private LocalDate vigenciaInicio;

    @Column(name = "vigencia_fim")
    private LocalDate vigenciaFim;

    public boolean vigenteEm(LocalDate data) {
        return !vigenciaInicio.isAfter(data)
                && (vigenciaFim == null || !vigenciaFim.isBefore(data));
    }

    public boolean participaDaConta() {
        return percentualRateio != null && percentualRateio.signum() > 0;
    }
}
