package br.com.brain.matricula;

import br.com.brain.enums.StatusMatricula;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MatriculaRepository extends JpaRepository<Matricula, Long> {

    /**
     * Uma matricula por aluno e ano letivo. Nao ha unique no banco porque
     * remanejamento entre unidades pode gerar uma segunda linha com a primeira
     * CANCELADA -- o servico e que decide, e precisa ver todas.
     */
    List<Matricula> findByAlunoIdAndAnoLetivoOrderByIdDesc(Long alunoId, Integer anoLetivo);

    Optional<Matricula> findByProcessoMatriculaIdAndStatus(Long processoId, StatusMatricula status);

    List<Matricula> findByAnoLetivoAndStatusOrderByIdAsc(Integer anoLetivo, StatusMatricula status);
}
