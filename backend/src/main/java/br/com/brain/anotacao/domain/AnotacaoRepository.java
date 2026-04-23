package br.com.brain.anotacao.domain;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AnotacaoRepository extends JpaRepository<Anotacao, Long> {
    @Query("SELECT a FROM Anotacao a WHERE a.aluno.id = :alunoId AND a.aula.disciplina.id = :disciplinaId")
    List<Anotacao> findByDisciplinaIdAndAlunoId(@Param("disciplinaId") Long disciplinaId,
            @Param("alunoId") Long alunoId);

    List<Anotacao> findByAulaIdAndDataAnotacao(Long aulaId, LocalDate dataAnotacao);
}
