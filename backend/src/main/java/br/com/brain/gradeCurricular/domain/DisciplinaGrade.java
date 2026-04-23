package br.com.brain.gradeCurricular.domain;

import br.com.brain.shared.domain.EntidadeBase;
import br.com.brain.disciplina.domain.Disciplina;
import br.com.brain.gradeCurricular.domain.GradeCurricular;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.envers.Audited;

@Entity
@Audited
@Table(name = "disciplinas_grades")
@Data
@EqualsAndHashCode(callSuper = false)
public class DisciplinaGrade extends EntidadeBase {

    @EmbeddedId
    private DisciplinaGradeId id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @MapsId("gradeCurricular")
    @JoinColumn(name = "grade_curricular_id")
    private GradeCurricular gradeCurricular;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @MapsId("disciplina")
    @JoinColumn(name = "disciplina_id")
    private Disciplina disciplina;

    @Column(name = "carga_horaria")
    private int cargaHoraria;

    private Boolean obrigatoria;
}
