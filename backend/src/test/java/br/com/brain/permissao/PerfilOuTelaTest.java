package br.com.brain.permissao;

import br.com.brain.autenticacao.DadosAutenticacao;
import br.com.brain.autenticacao.DadosAutenticacaoRepository;
import br.com.brain.dadosPessoais.DadosPessoais;
import br.com.brain.dadosPessoais.DadosPessoaisRepository;
import br.com.brain.enums.PerfilNome;
import br.com.brain.perfil.PerfilRepository;
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
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

/**
 * Regras de URL "perfil ou tela" (docs/permissoes.md, D26), pelo CRM: quem entra
 * pelo perfil continua entrando, e quem ganhou a tela passa a entrar.
 */
@SpringBootTest
@Transactional
@DisplayName("PerfilOuTela (regras de URL)")
class PerfilOuTelaTest {

    private static final int PROIBIDO = 403;

    @Autowired
    private WebApplicationContext context;
    @Autowired
    private GrupoUsuarioService grupoService;
    @Autowired
    private DadosPessoaisRepository dadosPessoaisRepository;
    @Autowired
    private DadosAutenticacaoRepository dadosAutenticacaoRepository;
    @Autowired
    private PerfilRepository perfilRepository;

    private MockMvc mvc;

    @BeforeEach
    void configurar() {
        mvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
    }

    @Test
    @DisplayName("secretaria entra no CRM pelo perfil, e o diretor pela hierarquia de perfis")
    void pelosPerfis() throws Exception {
        assertThat(status(user("secretaria").roles("SECRETARIO"))).isNotEqualTo(PROIBIDO);
        assertThat(status(user("diretor").roles("DIRETOR"))).isNotEqualTo(PROIBIDO);
    }

    @Test
    @DisplayName("professor só entra no CRM depois de ganhar a tela no acesso individual")
    void pelaTela() throws Exception {
        var professora = login(PerfilNome.PROFESSOR);
        assertThat(status(comoUsuario(professora))).isEqualTo(PROIBIDO);

        grupoService.salvarAcessosIndividuais(professora.getDadosPessoais().getId(), PerfilNome.PROFESSOR,
                new AcessosGrupoUsuarioDto(Set.of("SECRETARIA_CRM"), Set.of()));

        assertThat(status(comoUsuario(professora))).isNotEqualTo(PROIBIDO);
    }

    private int status(RequestPostProcessor quem) throws Exception {
        return mvc.perform(get("/crm/estagios").with(quem)).andReturn().getResponse().getStatus();
    }

    private static RequestPostProcessor comoUsuario(
            DadosAutenticacao login) {
        return authentication(new UsernamePasswordAuthenticationToken(login, null, login.getAuthorities()));
    }

    private DadosAutenticacao login(PerfilNome perfil) {
        var sufixo = UUID.randomUUID().toString().substring(0, 8);
        var dados = new DadosPessoais();
        dados.setNome("Pessoa " + sufixo);
        dados.setEmail("pessoa-" + sufixo + "@pessoal.test");
        dados.getPerfis().add(perfilRepository.findByNome(perfil));
        dados = dadosPessoaisRepository.save(dados);

        var login = new DadosAutenticacao();
        login.setEmail("login-" + sufixo + "@escola.test");
        login.setSenha("nao-usada");
        login.setVerificado(true);
        login.setAtivo(true);
        login.setDadosPessoais(dados);
        return dadosAutenticacaoRepository.save(login);
    }
}
