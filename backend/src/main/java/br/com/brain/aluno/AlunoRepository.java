package br.com.brain.aluno;

import br.com.brain.aula.Aula;
import java.util.List;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    long countByMatriculadoTrue();

    long countByMatriculadoTrueAndTurmaIsNull();

    /**
     * Busca de alunos matriculados usada pela Orientação: texto livre sobre nome e
     * matrícula, com filtros opcionais de unidade, série e turma. Um filtro nulo
     * não restringe o resultado.
     *
     * <p>A ordem dos operandos importa: o Hibernate infere o tipo de um parâmetro
     * pelo contexto em que ele aparece, e {@code :param IS NULL} não oferece
     * contexto nenhum. Com o {@code IS NULL} vindo primeiro o parâmetro era enviado
     * ao PostgreSQL como {@code bytea}, quebrando em {@code lower(bytea)} e em
     * {@code cast(bytea as bigint)}. Mantendo a comparação tipada à frente, o tipo
     * é resolvido e o {@code IS NULL} apenas reaproveita.
     */
    @Query("""
            SELECT aluno
            FROM Aluno aluno
            WHERE aluno.matriculado = true
            AND (LOWER(aluno.dadosPessoais.nome) LIKE LOWER(CONCAT('%', :termo, '%'))
                 OR LOWER(aluno.dadosPessoais.matricula) LIKE LOWER(CONCAT('%', :termo, '%'))
                 OR :termo IS NULL)
            AND (aluno.unidade.id = :unidadeId OR :unidadeId IS NULL)
            AND (aluno.serie.id = :serieId OR :serieId IS NULL)
            AND (aluno.turma.id = :turmaId OR :turmaId IS NULL)
            """)
    Page<Aluno> buscarMatriculadosParaOrientacao(
            @Param("termo") String termo,
            @Param("unidadeId") Long unidadeId,
            @Param("serieId") Long serieId,
            @Param("turmaId") Long turmaId,
            Pageable pageable);

    List<Aluno> findByTurmaIdAndMatriculadoTrue(Long turmaId);
}
