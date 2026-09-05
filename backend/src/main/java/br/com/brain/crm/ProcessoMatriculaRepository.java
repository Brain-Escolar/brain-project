package br.com.brain.crm;

import br.com.brain.enums.StatusProcessoMatricula;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProcessoMatriculaRepository extends JpaRepository<ProcessoMatricula, Long> {

    List<ProcessoMatricula> findByStatus(StatusProcessoMatricula status);

    List<ProcessoMatricula> findByStatusAndFuncionarioIsNullOrderByCriadoEmAsc(StatusProcessoMatricula status);

    List<ProcessoMatricula> findByStatusAndFuncionarioId(StatusProcessoMatricula status, Long funcionarioId);

    long countByStatusAndFuncionarioId(StatusProcessoMatricula status, Long funcionarioId);

    List<ProcessoMatricula> findByAlunoId(Long alunoId);
}
