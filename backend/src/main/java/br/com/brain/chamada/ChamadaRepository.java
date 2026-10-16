package br.com.brain.chamada;

import java.time.LocalDate;
import java.util.List;

import br.com.brain.diretor.projecao.FrequenciaAgregada;
import br.com.brain.diretor.projecao.FrequenciaMensal;
import br.com.brain.turma.Turma;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ChamadaRepository extends JpaRepository<Chamada, Long> {
    List<Chamada> findAllByAulaIdAndDataOrderByAlunoDadosPessoaisNomeAsc(Long aulaId, LocalDate data);

    @Query("SELECT COUNT(c) FROM Chamada c WHERE c.aluno.id = :alunoId AND c.aula.disciplina.id = :disciplinaId AND c.presente = false")
    Integer countFaltasByAlunoAndDisciplina(@Param("alunoId") Long alunoId, @Param("disciplinaId") Long disciplinaId);

    @Query("SELECT COUNT(c) FROM Chamada c WHERE c.aluno.id = :alunoId AND c.aula.disciplina.id = :disciplinaId")
    Integer countTotalByAlunoAndDisciplina(@Param("alunoId") Long alunoId, @Param("disciplinaId") Long disciplinaId);

    @Query("SELECT COUNT(c) FROM Chamada c WHERE c.aluno.id = :alunoId AND c.aula.disciplina.id = :disciplinaId "
            + "AND c.presente = false AND c.data BETWEEN :inicio AND :fim")
    Integer countFaltasByAlunoAndDisciplinaAndPeriodo(@Param("alunoId") Long alunoId,
            @Param("disciplinaId") Long disciplinaId, @Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    @Query("SELECT COUNT(c) FROM Chamada c WHERE c.aluno.id = :alunoId AND c.aula.disciplina.id = :disciplinaId "
            + "AND c.data BETWEEN :inicio AND :fim")
    Integer countTotalByAlunoAndDisciplinaAndPeriodo(@Param("alunoId") Long alunoId,
            @Param("disciplinaId") Long disciplinaId, @Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    /** Turmas em que o aluno já teve chamada registrada. */
    @Query("SELECT DISTINCT c.aula.turma FROM Chamada c WHERE c.aluno.id = :alunoId")
    List<Turma> findTurmasComChamadaDoAluno(@Param("alunoId") Long alunoId);

    /** Aulas e faltas de cada aluno, por disciplina, nas chamadas da turma dentro do intervalo. */
    @Query("""
            SELECT new br.com.brain.diretor.projecao.FrequenciaAgregada(
                c.aluno.id, c.aula.disciplina.id, COUNT(c),
                SUM(CASE WHEN c.presente = false THEN 1 ELSE 0 END))
            FROM Chamada c
            WHERE c.aula.turma.id = :turmaId AND c.data BETWEEN :inicio AND :fim
            GROUP BY c.aluno.id, c.aula.disciplina.id
            """)
    List<FrequenciaAgregada> agregarPorAlunoEDisciplina(@Param("turmaId") Long turmaId,
            @Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    /** Chamadas e presenças da escola inteira, mês a mês, dentro do intervalo. */
    @Query("""
            SELECT new br.com.brain.diretor.projecao.FrequenciaMensal(
                EXTRACT(YEAR FROM c.data), EXTRACT(MONTH FROM c.data), COUNT(c),
                SUM(CASE WHEN c.presente = true THEN 1 ELSE 0 END))
            FROM Chamada c
            WHERE c.data BETWEEN :inicio AND :fim
            GROUP BY EXTRACT(YEAR FROM c.data), EXTRACT(MONTH FROM c.data)
            ORDER BY EXTRACT(YEAR FROM c.data), EXTRACT(MONTH FROM c.data)
            """)
    List<FrequenciaMensal> frequenciaMensal(@Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);
}
