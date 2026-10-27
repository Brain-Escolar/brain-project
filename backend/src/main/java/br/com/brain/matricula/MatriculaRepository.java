package br.com.brain.matricula;

import br.com.brain.aluno.Aluno;
import br.com.brain.diretor.projecao.AlunosPorTurma;
import br.com.brain.enums.StatusMatricula;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.EnumSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface MatriculaRepository extends JpaRepository<Matricula, Long> {

    /**
     * Quem conta como aluno da turma: matricula viva ou ano concluido. Turma de
     * ano encerrado continua com a lista de quem estudou nela. Cancelada,
     * trancada e transferida saem.
     */
    Set<StatusMatricula> NA_TURMA = EnumSet.of(
            StatusMatricula.PRE_MATRICULA, StatusMatricula.EFETIVADA, StatusMatricula.CONCLUIDA);

    /** Matricula em andamento no ano: a que pode receber turma e sair. */
    Set<StatusMatricula> VIVAS = EnumSet.of(StatusMatricula.PRE_MATRICULA, StatusMatricula.EFETIVADA);

    /**
     * Uma matricula por aluno e ano letivo. Nao ha unique no banco porque
     * remanejamento entre unidades pode gerar uma segunda linha com a primeira
     * CANCELADA -- o servico e que decide, e precisa ver todas.
     */
    List<Matricula> findByAlunoIdAndAnoLetivoOrderByIdDesc(Long alunoId, Integer anoLetivo);

    Optional<Matricula> findByProcessoMatriculaIdAndStatus(Long processoId, StatusMatricula status);

    List<Matricula> findByAnoLetivoAndStatusOrderByIdAsc(Integer anoLetivo, StatusMatricula status);

    // ------------------------------------------------------------ alunos da turma

    @Query("""
            SELECT a FROM Matricula m JOIN m.aluno a JOIN FETCH a.dadosPessoais dp
            WHERE m.turma.id = :turmaId AND m.status IN :status
            ORDER BY dp.nome
            """)
    List<Aluno> findAlunosDaTurma(@Param("turmaId") Long turmaId,
            @Param("status") Collection<StatusMatricula> status);

    /** Alunos da turma (ver {@link #NA_TURMA}), com dados pessoais, em ordem de nome. */
    default List<Aluno> findAlunosDaTurma(Long turmaId) {
        return findAlunosDaTurma(turmaId, NA_TURMA);
    }

    @Query("SELECT COUNT(m) FROM Matricula m WHERE m.turma.id = :turmaId AND m.status IN :status")
    long countAlunosDaTurma(@Param("turmaId") Long turmaId,
            @Param("status") Collection<StatusMatricula> status);

    default long countAlunosDaTurma(Long turmaId) {
        return countAlunosDaTurma(turmaId, NA_TURMA);
    }

    @Query("""
            SELECT new br.com.brain.diretor.projecao.AlunosPorTurma(m.turma.id, COUNT(m))
            FROM Matricula m
            WHERE m.turma.id IN :turmaIds AND m.status IN :status
            GROUP BY m.turma.id
            """)
    List<AlunosPorTurma> contarAlunosPorTurma(@Param("turmaIds") Collection<Long> turmaIds,
            @Param("status") Collection<StatusMatricula> status);

    default List<AlunosPorTurma> contarAlunosPorTurma(Collection<Long> turmaIds) {
        return contarAlunosPorTurma(turmaIds, NA_TURMA);
    }

    // ------------------------------------------------------------------ historico

    /**
     * Todas as matriculas do aluno que chegaram a ter turma, de qualquer status:
     * quem saiu no meio do ano tambem estudou naquela turma.
     */
    @Query("""
            SELECT m FROM Matricula m
            JOIN FETCH m.turma t LEFT JOIN FETCH t.serie LEFT JOIN FETCH t.unidade
            WHERE m.aluno.id = :alunoId
            ORDER BY m.anoLetivo, m.id
            """)
    List<Matricula> findComTurmaDoAluno(@Param("alunoId") Long alunoId);

    // ---------------------------------------------------------------------- cache

    /**
     * Reaponta o cache de turma/serie/unidade em alunos para a matricula viva do
     * ano informado. Aluno sem matricula viva no ano fica sem turma (serie e
     * unidade ficam como estavam: sao tambem a serie pretendida do lead no CRM).
     *
     * Em massa e fora do Envers de proposito: alunos.turma_id e cache, e a
     * historia de verdade esta auditada em matriculas.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = """
            UPDATE alunos SET
                turma_id = (SELECT m.turma_id FROM matriculas m
                             WHERE m.aluno_id = alunos.id AND m.ano_letivo = :ano
                               AND m.status IN ('PRE_MATRICULA', 'EFETIVADA')
                             ORDER BY m.id DESC LIMIT 1),
                serie_id = COALESCE((SELECT m.serie_id FROM matriculas m
                             WHERE m.aluno_id = alunos.id AND m.ano_letivo = :ano
                               AND m.status IN ('PRE_MATRICULA', 'EFETIVADA')
                             ORDER BY m.id DESC LIMIT 1), serie_id),
                unidade_id = COALESCE((SELECT m.unidade_id FROM matriculas m
                             WHERE m.aluno_id = alunos.id AND m.ano_letivo = :ano
                               AND m.status IN ('PRE_MATRICULA', 'EFETIVADA')
                             ORDER BY m.id DESC LIMIT 1), unidade_id)
            """, nativeQuery = true)
    int sincronizarCacheDosAlunos(@Param("ano") int ano);
}
