package br.com.brain.usuario.gestao;

import br.com.brain.autenticacao.DadosAutenticacao;
import br.com.brain.autenticacao.DadosAutenticacaoRepository;
import br.com.brain.dadosPessoais.DadosPessoais;
import br.com.brain.dadosPessoais.DadosPessoaisRepository;
import br.com.brain.enums.PerfilNome;
import br.com.brain.perfil.PerfilRepository;
import br.com.brain.permissao.GrupoUsuarioService;
import br.com.brain.permissao.dto.AcessosGrupoUsuarioDto;

import java.util.Set;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** A URL /usuarios: ADMIN e DIRETOR pelo perfil, os outros pela tela (D44). */
@SpringBootTest
@Transactional
@DisplayName("Tela de Usuários (URL)")
class GestaoUsuariosControllerTest {

    @Autowired
    private WebApplicationContext context;
    @Autowired
    private GrupoUsuarioService grupoService;
    @Autowired
    private DadosPessoaisRepository dadosPessoaisRepository;
    @Autowired
    private DadosAutenticacaoRepository loginRepository;
    @Autowired
    private PerfilRepository perfilRepository;

    private MockMvc mvc;

    @BeforeEach
    void configurar() {
        mvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
    }

    @Test
    @DisplayName("diretor abre a lista pelo perfil; professor, não")
    void pelosPerfis() throws Exception {
        mvc.perform(get("/usuarios").with(como(login(PerfilNome.DIRETOR)))).andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        mvc.perform(get("/usuarios").with(como(login(PerfilNome.PROFESSOR)))).andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("a secretaria só entra depois de a escola liberar a tela num grupo dela (D45)")
    void secretariaPelaTela() throws Exception {
        var secretaria = login(PerfilNome.SECRETARIO);
        var professor = login(PerfilNome.PROFESSOR);
        var detalhe = "/usuarios/" + professor.getDadosPessoais().getId();
        mvc.perform(get("/usuarios").with(como(secretaria))).andExpect(status().isForbidden());

        grupoService.salvarAcessosIndividuais(secretaria.getDadosPessoais().getId(), PerfilNome.SECRETARIO,
                new AcessosGrupoUsuarioDto(Set.of("USUARIOS"), Set.of()));

        mvc.perform(get(detalhe).with(como(secretaria))).andExpect(status().isOk())
                .andExpect(jsonPath("$.acoes.desativar").value(false));
        // Ver não é agir: sem o controle de login, a ação responde 403.
        mvc.perform(post(detalhe + "/login/desativar").with(como(secretaria))).andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("sem login, /usuarios responde 403, e o DELETE /usuario/{id} não existe mais (U4)")
    void semLoginESemExcluir() throws Exception {
        mvc.perform(get("/usuarios")).andExpect(status().isForbidden());
        var alvo = login(PerfilNome.PROFESSOR);
        mvc.perform(delete("/usuario/" + alvo.getId()).with(como(login(PerfilNome.DIRETOR))));

        assertThat(loginRepository.findById(alvo.getId())).isPresent();
    }

    private static RequestPostProcessor como(DadosAutenticacao login) {
        return authentication(new UsernamePasswordAuthenticationToken(login, null, login.getAuthorities()));
    }

    private DadosAutenticacao login(PerfilNome perfil) {
        var sufixo = UUID.randomUUID().toString().substring(0, 8);
        var dados = new DadosPessoais();
        dados.setNome("Pessoa " + sufixo);
        dados.setEmail("pessoa-" + sufixo + "@pessoal.test");
        dados.getPerfis().add(perfilRepository.findByNome(perfil));
        var salvo = dadosPessoaisRepository.save(dados);

        var login = new DadosAutenticacao();
        login.setEmail("login-" + sufixo + "@escola.test");
        login.setSenha("nao-usada");
        login.setVerificado(true);
        login.setAtivo(true);
        login.setDadosPessoais(salvo);
        return loginRepository.save(login);
    }
}
