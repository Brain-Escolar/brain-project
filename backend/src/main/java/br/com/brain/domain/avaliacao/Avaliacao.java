package br.com.brain.domain.avaliacao;

import br.com.brain.domain.disciplina.Disciplina;
import br.com.brain.domain.evento.Evento;
import br.com.brain.domain.professor.Professor;
import br.com.brain.domain.turma.Turma;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.hibernate.envers.Audited;

import br.com.brain.domain.EntidadeBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Audited
@Table(name = "avaliacoes")
@Data
@EqualsAndHashCode(callSuper = false)
public class Avaliacao extends EntidadeBase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "disciplina_id", referencedColumnName = "id")
    private Disciplina disciplina;

    @Column(name = "nota_maxima")
    private BigDecimal notaMaxima;

    private String conteudo;

    @Column(name = "nota_extra")
    private Boolean notaExtra = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "professor_id", referencedColumnName = "id")
    private Professor professor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "turma_id", referencedColumnName = "id")
    private Turma turma;

    @Column(name = "data_aplicacao")
    private LocalDate dataAplicacao;

    @Column(name = "data_entrega_notas")
    private LocalDate dataEntregaNotas;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evento_id", referencedColumnName = "id")
    private Evento evento;

}
