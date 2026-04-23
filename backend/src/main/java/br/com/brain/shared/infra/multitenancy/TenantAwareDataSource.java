package br.com.brain.shared.infra.multitenancy;

import org.springframework.jdbc.datasource.DelegatingDataSource;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;

/**
 * DataSource wrapper que define o search_path do PostgreSQL em toda aquisição de conexão.
 * Dessa forma, qualquer operação JPA, JdbcTemplate ou Flyway usa automaticamente
 * o schema do tenant corrente (lido do TenantContext) — sem nenhuma mudança nos
 * repositories, services ou controllers existentes.
 */
public class TenantAwareDataSource extends DelegatingDataSource {

    public TenantAwareDataSource(DataSource targetDataSource) {
        super(targetDataSource);
    }

    @Override
    public Connection getConnection() throws SQLException {
        Connection connection = super.getConnection();
        applySchema(connection);
        return connection;
    }

    @Override
    public Connection getConnection(String username, String password) throws SQLException {
        Connection connection = super.getConnection(username, password);
        applySchema(connection);
        return connection;
    }

    private void applySchema(Connection connection) {
        String tenantId = TenantContext.getTenantId();
        String schema = (tenantId != null && !tenantId.isBlank()) ? tenantId : "public";
        try (Statement stmt = connection.createStatement()) {
            stmt.execute("SET search_path TO \"" + schema + "\"");
        } catch (Exception ignored) {
            // Bancos que não suportam search_path (ex: H2 em testes) são ignorados silenciosamente
        }
    }
}
