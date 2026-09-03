package br.com.brain.aluno;

import br.com.brain.aula.Aula;
import java.util.List;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AlunoRepository extends JpaRepository<Aluno, Long> {

    Optional<Aluno> findByDadosPessoaisId(Long dadosPessoaisId);

    Page<Aluno> findByMatriculadoTrue(Pageable pageable);

    Page<Aluno> findByMatriculadoFalseAndDataDesmatriculaIsNull(Pageable pageable);

    Page<Aluno> findByMatriculadoFalseAndDataDesmatriculaIsNotNull(Pageable pageable);

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

    long countByMatriculadoTrue();

    long countByMatriculadoTrueAndTurmaIsNull();

    /**
     * Busca de alunos matriculados usada pela Orientação: texto livre sobre nome e
     * matrícula, com filtros opcionais de unidade, série e turma. Um filtro nulo
     * não restringe o resultado.
     */
    @Query("""
            SELECT aluno
            FROM Aluno aluno
            WHERE aluno.matriculado = true
            AND (:termo IS NULL
                 OR LOWER(aluno.dadosPessoais.nome) LIKE LOWER(CONCAT('%', :termo, '%'))
                 OR LOWER(aluno.dadosPessoais.matricula) LIKE LOWER(CONCAT('%', :termo, '%')))
            AND (:unidadeId IS NULL OR aluno.unidade.id = :unidadeId)
            AND (:serieId IS NULL OR aluno.serie.id = :serieId)
            AND (:turmaId IS NULL OR aluno.turma.id = :turmaId)
            """)
    Page<Aluno> buscarMatriculadosParaOrientacao(
            @Param("termo") String termo,
            @Param("unidadeId") Long unidadeId,
            @Param("serieId") Long serieId,
            @Param("turmaId") Long turmaId,
            Pageable pageable);

    List<Aluno> findByTurmaIdAndMatriculadoTrue(Long turmaId);
}
