package br.com.brain.tarefa.domain;

import br.com.brain.professor.domain.Professor;
import br.com.brain.turma.domain.Turma;
import br.com.brain.shared.domain.EntidadeBase;
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

import java.time.LocalDate;

@Entity
@Audited
@Table(name = "tarefas")
@Data
@EqualsAndHashCode(callSuper = false)
public class Tarefa extends EntidadeBase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titulo;
    private String conteudo;
    private String documentoUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "professor_id", referencedColumnName = "id")
    private Professor professor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "turma_id", referencedColumnName = "id")
    private Turma turma;

    @Column(name = "data_criacao")
    private LocalDate dataCriacao;

    private LocalDate prazo;
}
