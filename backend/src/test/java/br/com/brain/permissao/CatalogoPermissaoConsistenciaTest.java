package br.com.brain.permissao;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * O catálogo vive em três lugares: a migration, o RoutesEnum do frontend e o
 * DependenciasPermissao. Este teste quebra quando um deles fica para trás
 * (docs/permissoes.md, seções 8.6 e 10).
 */
@SpringBootTest
@DisplayName("Catálogo de permissões — consistência")
class CatalogoPermissaoConsistenciaTest {

    /** A CI roda o backend em backend/ com o monorepo inteiro no checkout. */
    private static final Path ROUTES_ENUM = Path.of("..", "frontend", "src", "enums", "RoutesEnum.ts");

    @Autowired
    private JdbcTemplate jdbc;

    @Test
    @DisplayName("todo código de tela é uma chave do RoutesEnum do frontend")
    void telasExistemNoFrontend() throws IOException {
        Assumptions.assumeTrue(Files.exists(ROUTES_ENUM), "frontend fora do checkout");
        var chaves = Pattern.compile("^\\s+([A-Z_]+)\\s*=", Pattern.MULTILINE)
                .matcher(Files.readString(ROUTES_ENUM))
                .results()
                .map(m -> m.group(1))
                .collect(Collectors.toSet());

        assertThat(chaves).containsAll(jdbc.queryForList("select codigo from telas", String.class));
    }

    @Test
    @DisplayName("toda tela tem ao menos um perfil no teto")
    void nenhumaTelaSemTeto() {
        assertThat(jdbc.queryForList("""
                select t.codigo from telas t
                where not exists (select 1 from telas_perfis tp where tp.tela_id = t.id)
                """, String.class)).isEmpty();
    }

    @Test
    @DisplayName("perfil no teto de um controle com tela também está no teto da tela")
    void controleDentroDoTetoDaTela() {
        assertThat(jdbc.queryForList("""
                select c.codigo from controles c
                join controles_perfis cp on cp.controle_id = c.id
                where c.tela_id is not null
                  and not exists (select 1 from telas_perfis tp
                                  where tp.tela_id = c.tela_id and tp.perfil_id = cp.perfil_id)
                """, String.class)).isEmpty();
    }

    @Test
    @DisplayName("dependências apontam para itens que existem e estão no teto de quem exige")
    void dependenciasConsistentes() {
        Map<String, Set<String>> tetoPorItem = new HashMap<>();
        jdbc.query("""
                select t.codigo, p.nome from telas t
                join telas_perfis tp on tp.tela_id = t.id join perfis p on p.id = tp.perfil_id
                union all
                select c.codigo, p.nome from controles c
                join controles_perfis cp on cp.controle_id = c.id join perfis p on p.id = cp.perfil_id
                """, rs -> {
            tetoPorItem.computeIfAbsent(rs.getString(1), k -> new HashSet<>()).add(rs.getString(2));
        });

        DependenciasPermissao.todas().forEach((item, exigidos) -> {
            assertThat(tetoPorItem).as("item %s", item).containsKey(item);
            for (var exigido : exigidos) {
                assertThat(tetoPorItem).as("exigido %s por %s", exigido, item).containsKey(exigido);
                assertThat(tetoPorItem.get(exigido))
                        .as("quem pode receber %s também precisa poder receber %s", item, exigido)
                        .containsAll(tetoPorItem.get(item));
            }
        });
    }

    @Test
    @DisplayName("todo controle marcado como sensível existe no catálogo")
    void sensiveisExistem() {
        var controles = jdbc.queryForList("select codigo from controles", String.class);

        assertThat(controles).containsAll(ControlesSensiveis.todos());
    }

    @Test
    @DisplayName("superusuário não recebe situação familiar nem atendimento psicológico (D9)")
    void adminSemDadosDaOrientacao() {
        List<String> controlesDoAdmin = jdbc.queryForList("""
                select c.codigo from controles c
                join controles_perfis cp on cp.controle_id = c.id
                join perfis p on p.id = cp.perfil_id
                where p.nome = 'ADMIN'
                """, String.class);

        assertThat(controlesDoAdmin).noneMatch(codigo ->
                codigo.startsWith("SITUACAO_FAMILIAR.") || codigo.startsWith("ATENDIMENTO_PSICOLOGICO."));
    }
}
