package br.com.brain.matricula;

import br.com.brain.disciplina.Disciplina;
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

import java.math.BigDecimal;

/**
 * Resultado de uma disciplina no ano, congelado no encerramento. Nome, área e
 * carga horária são copiados: disciplina renomeada depois não reescreve o
 * histórico. Escrito uma vez e nunca alterado — por isso fora do Envers.
 */
@Entity
@Table(name = "resultados_disciplinas")
@Data
@EqualsAndHashCode(callSuper = false, of = "id")
public class ResultadoDisciplina extends EntidadeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "matricula_id", referencedColumnName = "id")
    private Matricula matricula;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "disciplina_id", referencedColumnName = "id")
    private Disciplina disciplina;

    @Column(name = "disciplina_nome")
    private String disciplinaNome;

    private String area;

    @Column(name = "carga_horaria")
    private Integer cargaHoraria;

    @Column(name = "nota_anual")
    private BigDecimal notaAnual;

    private BigDecimal recuperacao;

    @Column(name = "nota_final")
    private BigDecimal notaFinal;

    @Column(name = "total_faltas")
    private Integer totalFaltas;

    @Column(name = "total_aulas")
    private Integer totalAulas;

    private BigDecimal frequencia;

    private String situacao;
}
