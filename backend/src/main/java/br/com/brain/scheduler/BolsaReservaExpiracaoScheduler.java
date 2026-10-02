package br.com.brain.scheduler;

import br.com.brain.bolsa.BolsaConcessaoService;
import br.com.brain.infra.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Devolve ao orcamento de bolsa o que reservas vencidas ainda seguram.
 *
 * Sem isto, um lead que sumiu em marco continua ocupando orcamento em dezembro,
 * e a escola concede menos bolsa do que podia -- sem nenhum erro aparecer em
 * lugar nenhum.
 *
 * O banco e schema-por-tenant: o TenantAwareDataSource le o TenantContext a
 * cada conexao e aplica o search_path. Numa requisicao HTTP quem preenche esse
 * ThreadLocal e o filtro de seguranca; aqui nao ha requisicao, entao o job
 * itera as escolas ativas e troca o contexto a cada uma. Por isso o
 * TenantContext.clear() esta em finally: a thread do agendador e reaproveitada,
 * e um tenant vazado para a proxima volta faria uma escola mexer no orcamento
 * da outra.
 *
 * Roda de madrugada porque libera orcamento, e orcamento liberado durante o
 * expediente muda o teto na tela de quem esta no meio de uma negociacao.
 */
@Component
@RequiredArgsConstructor
public class BolsaReservaExpiracaoScheduler {

    private static final Logger log = LoggerFactory.getLogger(BolsaReservaExpiracaoScheduler.class);

    private final BolsaConcessaoService concessaoService;
    private final JdbcTemplate jdbcTemplate;

    @Scheduled(cron = "0 10 3 * * ?")
    public void expirarReservasDeTodasAsEscolas() {
        var schemas = listarSchemasAtivos();
        if (schemas.isEmpty()) {
            return;
        }

        var total = 0;
        for (var schema : schemas) {
            total += expirarDoTenant(schema);
        }
        log.info("Expiração de reservas de bolsa: {} liberada(s) em {} escola(s).", total, schemas.size());
    }

    /**
     * Uma escola que falha nao pode derrubar as outras: o try envolve UMA
     * iteracao, nao o laco. Orcamento preso numa escola e ruim; orcamento preso
     * em todas porque a primeira da lista quebrou e bem pior.
     */
    private int expirarDoTenant(String schema) {
        TenantContext.setTenantId(schema);
        try {
            var liberadas = concessaoService.expirarReservasVencidas();
            if (liberadas > 0) {
                log.info("Escola {}: {} reserva(s) de bolsa expirada(s).", schema, liberadas);
            }
            return liberadas;
        } catch (Exception e) {
            log.error("Falha ao expirar reservas de bolsa da escola {}.", schema, e);
            return 0;
        } finally {
            TenantContext.clear();
        }
    }

    /**
     * Lista qualificada com public. de proposito: sem tenant no contexto o
     * search_path ja cai em public, mas depender disso deixaria a consulta certa
     * por acidente.
     */
    private List<String> listarSchemasAtivos() {
        try {
            return jdbcTemplate.queryForList(
                    "SELECT schema_name FROM public.escolas WHERE ativa = true",
                    String.class);
        } catch (Exception e) {
            // Primeira subida, antes de existir escola cadastrada.
            log.debug("Nenhuma escola para expirar reservas: {}", e.getMessage());
            return List.of();
        }
    }
}
