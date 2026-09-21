package br.com.brain.aluno;

import br.com.brain.aula.Aula;
import java.util.List;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AlunoRepository extends JpaRepository<Aluno, Long>, JpaSpecificationExecutor<Aluno> {

    Optional<Aluno> findByDadosPessoaisId(Long dadosPessoaisId);

    @Query("""
            SELECT aula
            FROM Aula aula, Disciplina disc, Aluno aluno
            WHERE aula.disciplina.id = disc.id
            AND aluno.turma = aula.turma
            AND aluno.dadosPessoais.matricula = :matricula
            """)
    List<Aula> gerarGradeHoraria(@Param("matricula") String matricula);

    List<Aluno> findByUnidadeIdAndSerieIdAndTurmaIdAndMatriculadoTrueOrderByDadosPessoaisNomeAsc(Long unidadeId, Long serieId, Long turmaId);

    long countByTurmaIdAndMatriculadoTrue(Long turmaId);

    List<Aluno> findByTurmaIdAndMatriculadoTrue(Long turmaId);
}
