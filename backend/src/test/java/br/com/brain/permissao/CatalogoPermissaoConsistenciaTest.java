package br.com.brain.permissao;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;
import java.util.regex.Matcher;
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
 * O catálogo vive em vários lugares: as migrations, o RoutesEnum, o routesConfig
 * e os enums de módulo do frontend, e o DependenciasPermissao. Este teste quebra
 * quando um deles fica para trás (docs/permissoes.md, seções 8.6 e 10). Foi o
 * que faltou no merge da main de 29/10, que trouxe sete telas sem migration.
 */
@SpringBootTest
@DisplayName("Catálogo de permissões — consistência")
class CatalogoPermissaoConsistenciaTest {

    /** A CI roda o backend em backend/ com o monorepo inteiro no checkout. */
    private static final Path ROUTES_ENUM = Path.of("..", "frontend", "src", "enums", "RoutesEnum.ts");
    private static final Path MODULOS_ENUM = Path.of("..", "frontend", "src", "enums", "RoutesModuleEnum.ts");
    private static final Path SETORES_ENUM = Path.of("..", "frontend", "src", "enums", "RoutesSectionEnum.ts");
    private static final Path ROUTES_CONFIG = Path.of("..", "frontend", "src", "constants", "routesConfig.tsx");
    private static final Path PERFIS_DE_GRUPO = Path.of("..", "frontend", "src", "app", "(private)", "grupos-usuarios",
            "perfisDeGrupo.ts");

    @Autowired
    private JdbcTemplate jdbc;

    @Test
    @DisplayName("todo código de tela é uma chave do RoutesEnum do frontend")
    void telasExistemNoFrontend() throws IOException {
        Assumptions.assumeTrue(Files.exists(ROUTES_ENUM), "frontend fora do checkout");

        assertThat(chavesDoEnum(ROUTES_ENUM)).containsAll(jdbc.queryForList("select codigo from telas", String.class));
    }

    @Test
    @DisplayName("módulo é chave do RoutesModuleEnum e submódulo, do RoutesSectionEnum, em dois níveis")
    void modulosExistemNoFrontend() throws IOException {
        Assumptions.assumeTrue(Files.exists(MODULOS_ENUM) && Files.exists(SETORES_ENUM), "frontend fora do checkout");

        assertThat(chavesDoEnum(MODULOS_ENUM)).containsAll(
                jdbc.queryForList("select codigo from modulos where modulo_pai_id is null", String.class));
        assertThat(chavesDoEnum(SETORES_ENUM)).containsAll(
                jdbc.queryForList("select codigo from modulos where modulo_pai_id is not null", String.class));
        assertThat(jdbc.queryForList("""
                select m.codigo from modulos m
                join modulos pai on pai.id = m.modulo_pai_id
                where pai.modulo_pai_id is not null
                """, String.class)).as("submódulo de submódulo").isEmpty();
    }

    @Test
    @DisplayName("toda rota do routesConfig que não é livre tem tela no catálogo")
    void rotasDoMenuEstaoNoCatalogo() throws IOException {
        Assumptions.assumeTrue(Files.exists(ROUTES_CONFIG), "frontend fora do checkout");
        var semTela = new TreeSet<String>();
        entradasDoRoutesConfig().stream().filter(e -> !e.livre()).forEach(e -> semTela.add(e.rota()));
        semTela.removeAll(jdbc.queryForList("select codigo from telas", String.class));

        assertThat(semTela)
                .as("página nova sem migration (seção 10) ou sem livre: true no routesConfig")
                .isEmpty();
    }

    @Test
    @DisplayName("o teto de cada tela é a soma dos perfis das entradas dela no routesConfig")
    void tetoIgualAoRoutesConfig() throws IOException {
        Assumptions.assumeTrue(Files.exists(ROUTES_CONFIG), "frontend fora do checkout");
        Map<String, Set<String>> doFront = new TreeMap<>();
        entradasDoRoutesConfig().stream().filter(e -> !e.livre())
                .forEach(e -> doFront.computeIfAbsent(e.rota(), k -> new TreeSet<>()).addAll(e.perfis()));
        Map<String, Set<String>> doBanco = new TreeMap<>();
        jdbc.query("""
                select t.codigo, p.nome from telas t
                join telas_perfis tp on tp.tela_id = t.id join perfis p on p.id = tp.perfil_id
                where t.ativo = true
                """, rs -> {
            doBanco.computeIfAbsent(rs.getString(1), k -> new TreeSet<>()).add(rs.getString(2));
        });

        // Nos dois sentidos: tela ativa que saiu do routesConfig também quebra.
        var telas = new TreeSet<>(doFront.keySet());
        telas.addAll(doBanco.keySet());
        telas.forEach(tela -> assertThat(doBanco.get(tela)).as("teto de %s", tela).isEqualTo(doFront.get(tela)));
    }

    @Test
    @DisplayName("o módulo da tela é o da entrada dela no menu (setor, quando o módulo tem setores)")
    void moduloIgualAoMenu() throws IOException {
        Assumptions.assumeTrue(Files.exists(ROUTES_CONFIG), "frontend fora do checkout");
        Map<String, Set<String>> doMenu = new TreeMap<>();
        entradasDoRoutesConfig().stream()
                .filter(e -> !e.livre() && e.noMenu() && e.modulo() != null)
                .forEach(e -> doMenu.computeIfAbsent(e.rota(), k -> new TreeSet<>())
                        .add(e.setor() != null ? e.setor() : e.modulo()));
        Map<String, String> doBanco = new HashMap<>();
        jdbc.query("select t.codigo, m.codigo from telas t join modulos m on m.id = t.modulo_id",
                rs -> {
                    doBanco.put(rs.getString(1), rs.getString(2));
                });

        doMenu.forEach((tela, modulos) -> {
            assertThat(modulos).as("a tela %s está em mais de um módulo no menu", tela).hasSize(1);
            assertThat(doBanco.get(tela)).as("módulo de %s", tela).isEqualTo(modulos.iterator().next());
        });
    }

    @Test
    @DisplayName("todo perfil, menos o ADMIN, tem grupo padrão e aparece na tela de grupos")
    void todoPerfilTemGrupoPadrao() throws IOException {
        // Foi o que faltou no perfil FINANCEIRO, que entrou pela main em 04/11: quem
        // recebe um perfil sem grupo padrão faz login e não vê nada (D2).
        assertThat(jdbc.queryForList("""
                select p.nome from perfis p
                where p.nome <> 'ADMIN'
                  and not exists (select 1 from grupos_usuarios g where g.perfil_id = p.id and g.padrao = true)
                """, String.class)).as("perfil sem grupo padrão").isEmpty();

        Assumptions.assumeTrue(Files.exists(PERFIS_DE_GRUPO), "frontend fora do checkout");
        var tela = Files.readString(PERFIS_DE_GRUPO);
        assertThat(jdbc.queryForList("select nome from perfis where nome <> 'ADMIN'", String.class))
                .as("perfil fora do PERFIS_COM_GRUPO")
                .allMatch(perfil -> tela.contains("PerfilNomeEnum." + perfil));
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

    private static Set<String> chavesDoEnum(Path arquivo) throws IOException {
        return Pattern.compile("^\\s+([A-Z_]+)\\s*=", Pattern.MULTILINE)
                .matcher(Files.readString(arquivo))
                .results()
                .map(m -> m.group(1))
                .collect(Collectors.toSet());
    }

    /** Uma entrada do ROUTES do routesConfig, só com o que o catálogo espelha. */
    private record EntradaDeRota(String rota, Set<String> perfis, boolean noMenu, boolean livre,
                                 String modulo, String setor) {
    }

    /**
     * Lê as entradas do array ROUTES pelo texto: cada objeto de primeiro nível
     * entre os colchetes. As entradas não têm chaves dentro (o ícone é JSX sem
     * expressão), então contar { e } basta.
     */
    private static List<EntradaDeRota> entradasDoRoutesConfig() throws IOException {
        var texto = Files.readString(ROUTES_CONFIG);
        var inicio = texto.indexOf("export const ROUTES: RouteConfig[] = [");
        assertThat(inicio).as("declaração do ROUTES no routesConfig").isNotNegative();

        var entradas = new ArrayList<EntradaDeRota>();
        var profundidade = 0;
        var abertura = -1;
        for (var i = texto.indexOf('[', texto.indexOf("= [", inicio)) + 1; i < texto.length(); i++) {
            var c = texto.charAt(i);
            if (c == '{' && profundidade++ == 0) {
                abertura = i;
            } else if (c == '}' && --profundidade == 0) {
                entradas.add(entrada(texto.substring(abertura, i + 1)));
            } else if (c == ']' && profundidade == 0) {
                break;
            }
        }
        assertThat(entradas).as("entradas lidas do routesConfig").hasSizeGreaterThan(50);
        return entradas;
    }

    private static EntradaDeRota entrada(String objeto) {
        var perfis = new TreeSet<String>();
        var roles = Pattern.compile("roles:\\s*\\[([^\\]]*)]").matcher(objeto);
        if (roles.find()) {
            Pattern.compile("UserRoleEnum\\.([A-Z_]+)").matcher(roles.group(1)).results()
                    .forEach(m -> perfis.add(m.group(1)));
        }
        return new EntradaDeRota(
                grupo(objeto, "router:\\s*RoutesEnum\\.([A-Z_]+)"),
                perfis,
                "true".equals(grupo(objeto, "isShowMenu:\\s*(true|false)")),
                "true".equals(grupo(objeto, "livre:\\s*(true|false)")),
                grupo(objeto, "moduleMenu:\\s*RoutesModuleEnum\\.([A-Z_]+)"),
                grupo(objeto, "section:\\s*RoutesSectionEnum\\.([A-Z_]+)"));
    }

    private static String grupo(String texto, String regex) {
        Matcher m = Pattern.compile(regex).matcher(texto);
        return m.find() ? m.group(1) : null;
    }
}
