package br.com.brain.domain.aluno;

import br.com.brain.domain.aula.Aula;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AlunoRepository extends JpaRepository<Aluno, Long> {
    Page<Aluno> findByMatriculadoTrue(Pageable pageable);

    Page<Aluno> findByMatriculadoFalse(Pageable pageable);

    @Query("""
            SELECT aula
            FROM Aula aula, Disciplina disc, Aluno aluno
            WHERE aula.disciplina.id = disc.id
            AND aluno.turma = aula.turma
            AND aluno.dadosPessoais.matricula = :matricula
            """)
    List<Aula> gerarGradeHoraria(@Param("matricula") String matricula);

    List<Aluno> findByUnidadeIdAndSerieIdAndTurmaIdAndMatriculadoTrue(Long unidadeId, Long serieId, Long turmaId);

    long countByTurmaIdAndMatriculadoTrue(Long turmaId);

    List<Aluno> findByTurmaIdAndMatriculadoTrue(Long turmaId);
}
