package br.com.brain.anotacao;

import java.util.Collection;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AnotacaoRepository extends JpaRepository<Anotacao, Long> {
    @Query("SELECT a FROM Anotacao a WHERE a.aluno.id = :alunoId AND a.aula.disciplina.id = :disciplinaId")
    List<Anotacao> findByDisciplinaIdAndAlunoId(@Param("disciplinaId") Long disciplinaId,
            @Param("alunoId") Long alunoId);

    List<Anotacao> findByAulaIdAndDataAnotacaoOrderByAlunoDadosPessoaisNomeAsc(Long aulaId, LocalDate dataAnotacao);

    List<Anotacao> findByAlunoIdAndDataAnotacaoBetween(Long alunoId, LocalDate dataInicio, LocalDate dataFim);

    /** Anotações das aulas da turma no intervalo, com disciplina e professor carregados. */
    @Query("""
            SELECT a FROM Anotacao a
            JOIN FETCH a.aula au
            JOIN FETCH au.disciplina
            LEFT JOIN FETCH au.professor p
            LEFT JOIN FETCH p.dadosPessoais
            WHERE au.turma.id = :turmaId AND a.dataAnotacao BETWEEN :inicio AND :fim
            ORDER BY a.dataAnotacao DESC, a.id DESC
            """)
    List<Anotacao> findDaTurmaNoPeriodo(@Param("turmaId") Long turmaId,
            @Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    /** Anotações lançadas nas aulas no intervalo, com o aluno carregado, das mais recentes para as mais antigas. */
    @Query("""
            SELECT a FROM Anotacao a
            JOIN FETCH a.aula au
            JOIN FETCH a.aluno al
            JOIN FETCH al.dadosPessoais
            WHERE au.id IN :aulaIds AND a.dataAnotacao BETWEEN :inicio AND :fim
            ORDER BY a.dataAnotacao DESC, a.id DESC
            """)
    List<Anotacao> findDasAulasNoPeriodo(@Param("aulaIds") Collection<Long> aulaIds,
            @Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);
}
