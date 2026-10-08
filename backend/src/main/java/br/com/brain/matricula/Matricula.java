package br.com.brain.matricula;

import br.com.brain.aluno.Aluno;
import br.com.brain.crm.ProcessoMatricula;
import br.com.brain.enums.StatusMatricula;
import br.com.brain.enums.Turno;
import br.com.brain.serie.Serie;
import br.com.brain.shared.EntidadeBase;
import br.com.brain.turma.Turma;
import br.com.brain.unidade.Unidade;
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

import java.time.LocalDate;

/**
 * O vinculo do aluno com o ano letivo. E o documento academico; o financeiro
 * mora no contrato, e os dois nascem juntos na efetivacao.
 *
 * Existe separado de `alunos` porque um aluno atravessa vários anos letivos, e
 * cada ano tem sua serie, sua turma e seu contrato. Sem isto, rematricula
 * sobrescreveria o historico.
 */
@Entity
@Audited
@Table(name = "matriculas")
@Data
@EqualsAndHashCode(callSuper = false)
public class Matricula extends EntidadeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aluno_id", referencedColumnName = "id")
    private Aluno aluno;

    @Column(name = "ano_letivo")
    private Integer anoLetivo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unidade_id", referencedColumnName = "id")
    private Unidade unidade;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "serie_id", referencedColumnName = "id")
    private Serie serie;

    /** Nulo ate a enturmacao: matricular nao exige turma definida. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "turma_id", referencedColumnName = "id")
    private Turma turma;

    @Enumerated(EnumType.STRING)
    private Turno turno;

    @Enumerated(EnumType.STRING)
    private StatusMatricula status;

    /** De onde veio, quando veio do funil. Nulo em rematricula direta. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processo_matricula_id", referencedColumnName = "id")
    private ProcessoMatricula processoMatricula;

    /**
     * O banco cobra: status EFETIVADA exige esta data. E a data que vale para
     * contagem de vaga e para o inicio da cobranca.
     */
    @Column(name = "data_efetivacao")
    private LocalDate dataEfetivacao;

    @Column(name = "data_saida")
    private LocalDate dataSaida;

    @Column(name = "motivo_saida")
    private String motivoSaida;

    public boolean estaEfetivada() {
        return status == StatusMatricula.EFETIVADA;
    }
}
