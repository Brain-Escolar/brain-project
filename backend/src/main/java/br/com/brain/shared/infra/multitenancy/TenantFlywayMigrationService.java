package br.com.brain.shared.infra.multitenancy;

import org.flywaydb.core.Flyway;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.util.List;

@Service
public class TenantFlywayMigrationService {

    private static final Logger log = LoggerFactory.getLogger(TenantFlywayMigrationService.class);

    @Autowired
    private DataSource dataSource;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @EventListener(ApplicationReadyEvent.class)
    public void migrarTodosOsTenants() {
        log.info("Iniciando migrações Flyway...");
        migrarSistema();
        List<String> schemas = listarSchemasAtivos();
        log.info("Encontradas {} escola(s) ativa(s) para migrar.", schemas.size());
        schemas.forEach(this::migrarTenant);
        log.info("Migrações concluídas.");
    }

    private void migrarSistema() {
        log.info("Executando migrações do schema de sistema (public)...");
        Flyway.configure()
                .dataSource(dataSource)
                .schemas("public")
                .locations("classpath:db/sistema")
                .table("flyway_schema_history_sistema")
                .baselineOnMigrate(true)
                .baselineVersion("0")
                .load()
                .migrate();
    }

    public void migrarTenant(String schema) {
        log.info("Executando migrações para o schema: {}", schema);
        Flyway.configure()
                .dataSource(dataSource)
                .schemas(schema)
                .locations("classpath:db/migration")
                .load()
                .migrate();
    }

    private List<String> listarSchemasAtivos() {
        try {
            return jdbcTemplate.queryForList(
                    "SELECT schema_name FROM public.escolas WHERE ativa = true",
                    String.class);
        } catch (Exception e) {
            // Tabela ainda não existe na primeira inicialização
            log.info("Tabela public.escolas ainda não existe. Nenhum tenant para migrar.");
            return List.of();
        }
    }
}
