package br.com.brain.notas;

import java.util.Collection;
import br.com.brain.diretor.projecao.NotasLancadas;
import br.com.brain.diretor.projecao.MediaPorSerie;
import br.com.brain.enums.TipoAvaliacao;
import br.com.brain.turma.Turma;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface NotasRepository extends JpaRepository<Notas, Long> {

    long countByAvaliacaoTurmaId(Long avaliacaoTurmaId);

    List<Notas> findByAlunoIdAndAvaliacaoTurmaAvaliacaoDisciplinaId(Long alunoId, Long disciplinaId);

    /** Turmas em que o aluno já teve nota lançada — a trilha dele ano a ano. */
    @Query("SELECT DISTINCT at.turma FROM Notas n JOIN n.avaliacaoTurma at WHERE n.aluno.id = :alunoId")
    List<Turma> findTurmasComNotaDoAluno(@Param("alunoId") Long alunoId);

    /** Todas as notas lançadas para a turma, já com a avaliação (tipo e disciplina) carregada. */
    @Query("""
            SELECT n FROM Notas n
            JOIN FETCH n.avaliacaoTurma at
            JOIN FETCH at.avaliacao a
            WHERE at.turma.id = :turmaId AND n.pontuacao IS NOT NULL
            """)
    List<Notas> findComAvaliacaoByTurmaId(@Param("turmaId") Long turmaId);

    /** Média das notas regulares (sem recuperação) por série, num intervalo de datas de referência. */
    @Query("""
            SELECT new br.com.brain.diretor.projecao.MediaPorSerie(s.id, s.nome, AVG(n.pontuacao))
            FROM Notas n JOIN n.avaliacaoTurma at JOIN at.avaliacao a JOIN at.turma t JOIN t.serie s
            WHERE n.pontuacao IS NOT NULL AND a.tipo <> :excluido
              AND n.periodoReferencia BETWEEN :inicio AND :fim
            GROUP BY s.id, s.nome
            ORDER BY s.nome
            """)
    List<MediaPorSerie> mediaPorSerie(@Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim,
            @Param("excluido") TipoAvaliacao excluido);

    /** Média geral das notas regulares (sem recuperação) num intervalo de datas de referência. */
    @Query("""
            SELECT AVG(n.pontuacao)
            FROM Notas n JOIN n.avaliacaoTurma at JOIN at.avaliacao a
            WHERE n.pontuacao IS NOT NULL AND a.tipo <> :excluido
              AND n.periodoReferencia BETWEEN :inicio AND :fim
            """)
    Double mediaGeral(@Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim,
            @Param("excluido") TipoAvaliacao excluido);

    /** Quantas notas já foram lançadas em cada avaliação de turma, e a média delas. */
    @Query("""
            SELECT new br.com.brain.diretor.projecao.NotasLancadas(n.avaliacaoTurma.id, COUNT(n), AVG(n.pontuacao))
            FROM Notas n
            WHERE n.avaliacaoTurma.id IN :avaliacaoTurmaIds AND n.pontuacao IS NOT NULL
            GROUP BY n.avaliacaoTurma.id
            """)
    List<NotasLancadas> contarLancadas(@Param("avaliacaoTurmaIds") Collection<Long> avaliacaoTurmaIds);
}
