package br.com.brain.permissao;

import br.com.brain.autenticacao.DadosAutenticacao;
import br.com.brain.autenticacao.DadosAutenticacaoRepository;
import br.com.brain.dadosPessoais.DadosPessoais;
import br.com.brain.dadosPessoais.DadosPessoaisRepository;
import br.com.brain.enums.PerfilNome;
import br.com.brain.perfil.PerfilRepository;

import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** GET /permissoes/me pela camada HTTP: exige login e devolve o formato que o frontend lê. */
@SpringBootTest
@Transactional
@DisplayName("PermissaoController")
class PermissaoControllerTest {

    @Autowired
    private WebApplicationContext context;
    @Autowired
    private GrupoPadraoService grupoPadraoService;
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
    @DisplayName("sem login, não responde")
    void exigeLogin() throws Exception {
        mvc.perform(get("/permissoes/me")).andExpect(status().is4xxClientError());
    }

    @Test
    @DisplayName("devolve telas e controles por perfil de quem está logado")
    void devolvePorPerfil() throws Exception {
        var secretaria = login(PerfilNome.SECRETARIO);
        grupoPadraoService.vincular(secretaria.getDadosPessoais(), PerfilNome.SECRETARIO);

        mvc.perform(get("/permissoes/me").with(authentication(
                        new UsernamePasswordAuthenticationToken(secretaria, null, secretaria.getAuthorities()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.gerenciaPermissoes").value(false))
                .andExpect(jsonPath("$.perfis.SECRETARIO.telas", hasSize(11)))
                .andExpect(jsonPath("$.perfis.SECRETARIO.controles", hasSize(5)));
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
