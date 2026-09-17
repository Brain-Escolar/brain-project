package br.com.brain.bolsa;

import br.com.brain.enums.StatusConcessaoBolsa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public interface ConcessaoBolsaRepository extends JpaRepository<ConcessaoBolsa, Long> {

    List<ConcessaoBolsa> findBySimulacaoIdAndStatus(Long simulacaoId, StatusConcessaoBolsa status);

    List<ConcessaoBolsa> findBySimulacaoIdOrderByIdAsc(Long simulacaoId);

    List<ConcessaoBolsa> findByContratoIdOrderByIdAsc(Long contratoId);

    /**
     * Para a leitura do controller, que monta o DTO FORA de transacao.
     *
     * tipoBolsa e simulacao sao LAZY e o DTO le o nome de um e a validade da
     * outra: sem o fetch, LazyInitializationException na serializacao. Foi
     * exatamente o que aconteceu com TipoBolsa.produtos no calculo do teto.
     */
    @Query("""
            SELECT c FROM ConcessaoBolsa c
              JOIN FETCH c.tipoBolsa
              LEFT JOIN FETCH c.simulacao
             WHERE c.simulacao.id = :simulacaoId
             ORDER BY c.id
            """)
    List<ConcessaoBolsa> buscarDaSimulacaoParaLeitura(@Param("simulacaoId") Long simulacaoId);

    /**
     * Quanto de renuncia esta simulacao ja carrega. Usado para manter
     * valor_desconto coerente com a soma das concessoes -- a simulacao tem um
     * CHECK exigindo valor_liquido = valor_bruto - valor_desconto, entao os dois
     * numeros nao podem andar separados.
     */
    @Query("""
            SELECT COALESCE(SUM(c.valorRenunciaAnual), 0) FROM ConcessaoBolsa c
             WHERE c.simulacao.id = :simulacaoId
               AND c.status IN (br.com.brain.enums.StatusConcessaoBolsa.RESERVADA,
                                br.com.brain.enums.StatusConcessaoBolsa.ATIVA)
            """)
    BigDecimal somarRenunciaVigenteDaSimulacao(@Param("simulacaoId") Long simulacaoId);

    /**
     * Reservas vencidas. Sem isto, lead que sumiu em marco continua ocupando
     * orcamento de bolsa em dezembro e a escola concede menos do que podia.
     */
    @Query("""
            SELECT c FROM ConcessaoBolsa c
             JOIN c.simulacao s
             WHERE c.status = br.com.brain.enums.StatusConcessaoBolsa.RESERVADA
               AND s.reservaExpiraEm IS NOT NULL
               AND s.reservaExpiraEm < :agora
             ORDER BY c.id
            """)
    List<ConcessaoBolsa> buscarReservasVencidas(@Param("agora") Instant agora);
}
