package br.com.brain.simulacao;

import br.com.brain.enums.StatusSimulacaoFinanceira;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface SimulacaoFinanceiraRepository extends JpaRepository<SimulacaoFinanceira, Long> {

    List<SimulacaoFinanceira> findByProcessoMatriculaIdOrderByIdDesc(Long processoMatriculaId);

    List<SimulacaoFinanceira> findByAlunoIdOrderByIdDesc(Long alunoId);

    Optional<SimulacaoFinanceira> findByContratoId(Long contratoId);

    /**
     * Simulacoes cuja reserva venceu. O job devolve o orcamento que elas seguram
     * e marca como EXPIRADA.
     */
    @Query("""
            SELECT s FROM SimulacaoFinanceira s
             WHERE s.status = br.com.brain.enums.StatusSimulacaoFinanceira.RESERVADA
               AND s.reservaExpiraEm IS NOT NULL
               AND s.reservaExpiraEm < :agora
             ORDER BY s.id
            """)
    List<SimulacaoFinanceira> buscarReservasVencidas(@Param("agora") Instant agora);

    List<SimulacaoFinanceira> findByStatusOrderByIdAsc(StatusSimulacaoFinanceira status);
}
