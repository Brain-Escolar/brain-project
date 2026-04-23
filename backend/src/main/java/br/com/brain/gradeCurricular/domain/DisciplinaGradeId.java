package br.com.brain.gradeCurricular.domain;

import br.com.brain.disciplina.domain.Disciplina;
import br.com.brain.gradeCurricular.domain.GradeCurricular;
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
