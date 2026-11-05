package br.com.brain.gradeCurricular;

import br.com.brain.disciplina.Disciplina;
import br.com.brain.gradeCurricular.dto.CadastroGradeCurricularDto;
import br.com.brain.grupo.GrupoDisciplina;
import br.com.brain.serie.Serie;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Contra banco de proposito: o que quebrou foi o mapeamento da chave composta
 * de DisciplinaGrade (@EmbeddedId + @MapsId), que so aparece no persist real.
 */
@SpringBootTest
@Transactional
@DisplayName("GradeCurricularService")
class GradeCurricularServiceTest {

    @Autowired
    private GradeCurricularService service;

    @Autowired
    private EntityManager em;

    @Test
    @DisplayName("cadastra a grade junto com as disciplinas vinculadas")
    void cadastraGradeComDisciplinas() {
        var serie = new Serie();
        serie.setNome("1º ano");
        em.persist(serie);
        var grupo = new GrupoDisciplina();
        grupo.setNome("Base comum");
        grupo.setArea("Exatas");
        em.persist(grupo);
        var matematica = disciplina("Matemática", serie, grupo);
        var portugues = disciplina("Português", serie, grupo);

        var grade = service.cadastrarGradeCurricular(new CadastroGradeCurricularDto(
                "Fundamental I", "2026", null, List.of(matematica.getId(), portugues.getId())));
        em.flush();
        em.clear();

        Long vinculos = em.createQuery(
                "select count(dg) from DisciplinaGrade dg where dg.gradeCurricular.id = :grade", Long.class)
                .setParameter("grade", grade.getId())
                .getSingleResult();
        assertThat(vinculos).isEqualTo(2);
    }

    private Disciplina disciplina(String nome, Serie serie, GrupoDisciplina grupo) {
        var disciplina = new Disciplina();
        disciplina.setSerie(serie);
        disciplina.setGrupo(grupo);
        disciplina.setNome(nome);
        em.persist(disciplina);
        return disciplina;
    }
}
