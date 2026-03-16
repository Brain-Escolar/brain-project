package br.com.brain.domain.disciplinaGrade;

import br.com.brain.domain.EntidadeBase;
import br.com.brain.domain.disciplina.Disciplina;
import br.com.brain.domain.gradeCurricular.GradeCurricular;
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

@Entity
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
