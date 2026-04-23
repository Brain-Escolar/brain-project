package br.com.brain.disponibilidadeProfessor.domain;

import br.com.brain.horario.domain.Horario;
import br.com.brain.professor.domain.Professor;
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
@Table(name = "disponibilidade_professor")
@Data
@EqualsAndHashCode(callSuper = false)
public class DisponibilidadeProfessor extends EntidadeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "professor_id", referencedColumnName = "id")
    private Professor professor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "horario_id", referencedColumnName = "id")
    private Horario horario;

    @Column(name = "data_vigencia")
    private LocalDate dataVigencia;
}
