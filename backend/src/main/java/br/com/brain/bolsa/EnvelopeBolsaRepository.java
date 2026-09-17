package br.com.brain.bolsa;

import br.com.brain.enums.NaturezaEnvelope;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

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

    /** Mesmo escopo, so os ids: e o que se precisa saber antes de travar. */
    @Query("""
            SELECT e.id FROM EnvelopeBolsa e
             WHERE e.politica.id = :politicaId
               AND e.ativo = true
               AND e.natureza = :natureza
               AND (e.unidade IS NULL OR e.unidade.id = :unidadeId)
               AND (e.serie IS NULL OR e.serie.id = :serieId)
               AND (e.tipoBolsa IS NULL OR e.tipoBolsa.id = :tipoBolsaId)
             ORDER BY e.id
            """)
    List<Long> buscarIdsDoEscopo(
            @Param("politicaId") Long politicaId,
            @Param("natureza") NaturezaEnvelope natureza,
            @Param("unidadeId") Long unidadeId,
            @Param("serieId") Long serieId,
            @Param("tipoBolsaId") Long tipoBolsaId);

    /**
     * SELECT ... FOR UPDATE em UM envelope.
     *
     * Sem lock, duas matriculas simultaneas leem o mesmo saldo, cada uma se acha
     * dentro do teto e as duas gravam -- o orcamento estoura sem ninguem ter
     * feito nada errado.
     *
     * Trava um por vez, e nao a lista inteira, porque quem garante a ausencia de
     * deadlock e a ORDEM: se todas as transacoes travam em ordem crescente de
     * id, duas que disputem os mesmos envelopes se enfileiram -- uma segura o
     * menor e a outra espera por ele, nunca em circulo. Um IN de varias linhas
     * nao promete ordem de aquisicao nenhuma. Quem chama ordena: ver
     * travarEmOrdem no servico.
     *
     * QUERY NATIVA, e nao @Lock(PESSIMISTIC_WRITE), por portabilidade. Com
     * PESSIMISTIC_WRITE o Hibernate emite `FOR NO KEY UPDATE`, que e valido no
     * PostgreSQL e o H2 nao entende -- e o perfil de teste roda H2 com o dialeto
     * do PostgreSQL, entao o lock quebrava em todo teste de integracao. `FOR
     * UPDATE` puro os dois entendem.
     *
     * A diferenca pratica no PostgreSQL: FOR UPDATE tambem bloqueia INSERT de
     * linha que referencie este envelope por FK, o que FOR NO KEY UPDATE
     * deixaria passar. Aqui isso e indiferente -- a unica tabela que aponta para
     * ca e movimentos_envelope, e quem grava movimento ja precisa deste mesmo
     * lock de qualquer forma.
     */
    @Query(value = "SELECT * FROM envelopes_bolsa WHERE id = :id FOR UPDATE", nativeQuery = true)
    Optional<EnvelopeBolsa> travar(@Param("id") Long id);

    /**
     * Receita bruta ja contratada no escopo do envelope, para o teto percentual
     * com base RECEITA_REALIZADA.
     *
     * Query nativa de proposito: contratos_servico e matriculas ainda nao tem
     * entidade JPA (sao da proxima fatia), e esta soma nao precisa delas.
     *
     * O CAST nos parametros nao e enfeite: `:param IS NULL` sem tipo faz o
     * PostgreSQL recusar com "could not determine data type of parameter",
     * porque o parametro aparece antes de qualquer coluna que daria o tipo.
     * Envelope global tem unidade e serie nulas, entao esse e o caminho comum.
     */
    @Query(value = """
            SELECT COALESCE(SUM(c.valor_bruto), 0)
              FROM contratos_servico c
              JOIN matriculas m ON m.id = c.matricula_id
             WHERE c.status = 'VIGENTE'
               AND m.ano_letivo = :anoLetivo
               AND (CAST(:unidadeId AS bigint) IS NULL OR m.unidade_id = CAST(:unidadeId AS bigint))
               AND (CAST(:serieId AS bigint) IS NULL OR m.serie_id = CAST(:serieId AS bigint))
            """, nativeQuery = true)
    BigDecimal somarReceitaRealizada(
            @Param("anoLetivo") Integer anoLetivo,
            @Param("unidadeId") Long unidadeId,
            @Param("serieId") Long serieId);
}
