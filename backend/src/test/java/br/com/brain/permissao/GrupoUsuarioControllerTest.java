package br.com.brain.permissao;

import br.com.brain.dadosPessoais.DadosPessoais;
import br.com.brain.dadosPessoais.DadosPessoaisRepository;
import br.com.brain.enums.PerfilNome;
import br.com.brain.perfil.PerfilRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * A camada HTTP da tela de grupos: quem entra (regra em SecurityConfigurations)
 * e o formato do que o frontend lê.
 */
@SpringBootTest
@Transactional
@DisplayName("GrupoUsuarioController")
class GrupoUsuarioControllerTest {

    @Autowired
    private WebApplicationContext context;
    @Autowired
    private JdbcTemplate jdbc;
    @Autowired
    private DadosPessoaisRepository dadosPessoaisRepository;
    @Autowired
    private PerfilRepository perfilRepository;

    private MockMvc mvc;

    @BeforeEach
    void configurar() {
        mvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
    }

    @Test
    @DisplayName("ADMIN e DIRETOR acessam; os demais perfis e quem não está logado, não")
    void acessoRestrito() throws Exception {
        mvc.perform(get("/grupos-usuarios").with(user("admin").roles("ADMIN"))).andExpect(status().isOk());
        mvc.perform(get("/grupos-usuarios").with(user("diretor").roles("DIRETOR"))).andExpect(status().isOk());
        mvc.perform(get("/grupos-usuarios").with(user("secretaria").roles("SECRETARIO")))
                .andExpect(status().isForbidden());
        mvc.perform(get("/permissoes/catalogo").param("perfil", "SECRETARIO")
                .with(user("professor").roles("PROFESSOR"))).andExpect(status().isForbidden());
        mvc.perform(get("/grupos-usuarios")).andExpect(status().is4xxClientError());
    }

    @Test
    @DisplayName("o catálogo do perfil vem com as telas do teto")
    void catalogo() throws Exception {
        mvc.perform(get("/permissoes/catalogo").param("perfil", "SECRETARIO").with(user("admin").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.perfil").value("SECRETARIO"))
                .andExpect(jsonPath("$.telas", hasSize(11)))
                .andExpect(jsonPath("$.dependencias.ALUNO_CADASTRO[0]").value("ALUNO.DADOS_PESSOAIS.VER"));
    }

    @Test
    @DisplayName("a lista de membros é uma página com content e totalElements")
    void paginaDeMembros() throws Exception {
        mvc.perform(get("/grupos-usuarios/{id}/membros", grupoPadrao("SECRETARIO")).param("size", "5")
                        .with(user("admin").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.totalElements").isNumber());
    }

    @Test
    @DisplayName("acessos inválidos devolvem 422 com a explicação")
    void acessosInvalidos() throws Exception {
        mvc.perform(put("/grupos-usuarios/{id}/acessos", grupoPadrao("SECRETARIO"))
                        .with(user("admin").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"telas\": [\"ALUNO_CADASTRO\"], \"controles\": []}"))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.message", containsString("ALUNO_CADASTRO exige ALUNO.DADOS_PESSOAIS.VER")));
    }

    @Test
    @DisplayName("acessos individuais: só ADMIN e DIRETOR, e a resposta traz os individuais")
    void acessosIndividuais() throws Exception {
        var pessoa = new DadosPessoais();
        pessoa.setNome("Secretária Teste");
        pessoa.setEmail("secretaria-individual@pessoal.test");
        pessoa.getPerfis().add(perfilRepository.findByNome(PerfilNome.SECRETARIO));
        var id = dadosPessoaisRepository.save(pessoa).getId();

        mvc.perform(get("/grupos-usuarios/individuais/{id}", id).param("perfil", "SECRETARIO")
                        .with(user("secretaria").roles("SECRETARIO")))
                .andExpect(status().isForbidden());
        mvc.perform(put("/grupos-usuarios/individuais/{id}", id).param("perfil", "SECRETARIO")
                        .with(user("diretor").roles("DIRETOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"telas\": [\"SECRETARIA_CRM\"], \"controles\": []}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.perfil").value("SECRETARIO"))
                .andExpect(jsonPath("$.nome").value("Secretária Teste"))
                .andExpect(jsonPath("$.telas[0]").value("SECRETARIA_CRM"))
                .andExpect(jsonPath("$.herdados").isMap());
    }

    private Long grupoPadrao(String perfil) {
        return jdbc.queryForObject("""
                select g.id from grupos_usuarios g join perfis p on p.id = g.perfil_id
                where g.padrao = true and p.nome = ?
                """, Long.class, perfil);
    }
}
