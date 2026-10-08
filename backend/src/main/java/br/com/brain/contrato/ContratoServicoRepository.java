package br.com.brain.contrato;

import br.com.brain.enums.StatusContratoServico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ContratoServicoRepository extends JpaRepository<ContratoServico, Long> {

    List<ContratoServico> findByMatriculaIdOrderByIdDesc(Long matriculaId);

    /**
     * Quantos contratos esta matricula ja teve. Usado para numerar: rescindir e
     * refazer gera um segundo contrato para a MESMA matricula, e `numero` e unico
     * no banco -- sem o sufixo, o segundo estoura a constraint.
     */
    int countByMatriculaId(Long matriculaId);

    boolean existsByMatriculaIdAndStatus(Long matriculaId, StatusContratoServico status);

    /**
     * Com os itens carregados, para a leitura que monta o DTO fora de transacao.
     * DISTINCT porque o fetch da colecao multiplica as linhas.
     */
    @Query("""
            SELECT DISTINCT c FROM ContratoServico c
              LEFT JOIN FETCH c.itens
             WHERE c.id = :id
            """)
    Optional<ContratoServico> buscarComItens(@Param("id") Long id);
}
