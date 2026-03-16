package br.com.brain.domain.disciplinaGrade;

import br.com.brain.domain.disciplina.Disciplina;
import br.com.brain.domain.gradeCurricular.GradeCurricular;
import jakarta.persistence.Embeddable;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.FetchType;
import java.io.Serializable;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@EqualsAndHashCode
public class DisciplinaGradeId implements Serializable {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grade_curricular_id")
    private GradeCurricular gradeCurricular;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "disciplina_id")
    private Disciplina disciplina;
}
