package br.com.brain.bolsa;

import br.com.brain.enums.NaturezaEnvelope;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface EnvelopeBolsaRepository extends JpaRepository<EnvelopeBolsa, Long> {

    /**
     * Envelopes que cobrem uma concessao. Uma concessao atinge TODOS os que
     * casam com o escopo (o global, o da serie, o do tipo), entao para decidir o
     * teto vale o mais restritivo.
     */
    @Query("""
            SELECT e FROM EnvelopeBolsa e
             WHERE e.politica.id = :politicaId
               AND e.ativo = true
               AND e.natureza = :natureza
               AND (e.unidade IS NULL OR e.unidade.id = :unidadeId)
               AND (e.serie IS NULL OR e.serie.id = :serieId)
               AND (e.tipoBolsa IS NULL OR e.tipoBolsa.id = :tipoBolsaId)
             ORDER BY e.id
            """)
    List<EnvelopeBolsa> buscarDoEscopo(
            @Param("politicaId") Long politicaId,
            @Param("natureza") NaturezaEnvelope natureza,
            @Param("unidadeId") Long unidadeId,
            @Param("serieId") Long serieId,
            @Param("tipoBolsaId") Long tipoBolsaId);

    /**
     * Receita bruta ja contratada no escopo do envelope, para o teto percentual
     * com base RECEITA_REALIZADA.
     *
     * Query nativa de proposito: contratos_servico e matriculas ainda nao tem
     * entidade JPA (sao da proxima fatia), e esta soma nao precisa delas.
     */
    @Query(value = """
            SELECT COALESCE(SUM(c.valor_bruto), 0)
              FROM contratos_servico c
              JOIN matriculas m ON m.id = c.matricula_id
             WHERE c.status = 'VIGENTE'
               AND m.ano_letivo = :anoLetivo
               AND (:unidadeId IS NULL OR m.unidade_id = :unidadeId)
               AND (:serieId IS NULL OR m.serie_id = :serieId)
            """, nativeQuery = true)
    BigDecimal somarReceitaRealizada(
            @Param("anoLetivo") Integer anoLetivo,
            @Param("unidadeId") Long unidadeId,
            @Param("serieId") Long serieId);
}
