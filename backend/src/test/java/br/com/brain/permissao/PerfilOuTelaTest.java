package br.com.brain.permissao;

import br.com.brain.autenticacao.DadosAutenticacao;
import br.com.brain.autenticacao.DadosAutenticacaoRepository;
import br.com.brain.dadosPessoais.DadosPessoais;
import br.com.brain.dadosPessoais.DadosPessoaisRepository;
import br.com.brain.enums.PerfilNome;
import br.com.brain.perfil.PerfilRepository;
import br.com.brain.permissao.dto.AcessosGrupoUsuarioDto;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;

/**
 * Regras de URL "perfil ou tela" (docs/permissoes.md, D26), pelo CRM: quem entra
 * pelo perfil continua entrando, e quem ganhou a tela passa a entrar.
 */
@SpringBootTest
@Transactional
@DisplayName("PerfilOuTela (regras de URL)")
class PerfilOuTelaTest {

    private static final int PROIBIDO = 403;
    private static final String ESTORNO = "/financeiro/pagamentos/1/estorno";
    private static final String APROVAR_PRECO = "/produto/precos/1/aprovacao";
    private static final String PESSOA_EXISTENTE = "/dados-pessoais/existente";

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

    @Test
    @DisplayName("o FINANCEIRO entra nas áreas de dinheiro, e não nas de documentos e dados pessoais")
    void areasDoFinanceiro() throws Exception {
        var financeiro = user("financeiro").roles("FINANCEIRO");

        for (var rota : List.of("/bolsas/tipos", "/simulacoes/1", "/contratos/1", "/financeiro/inadimplencia",
                "/produto")) {
            assertThat(status(get(rota), financeiro)).as(rota).isNotEqualTo(PROIBIDO);
        }
        for (var rota : List.of("/documentos/1", "/documentos-escolares/1", "/dados-pessoais/existente", "/crm/estagios")) {
            assertThat(status(get(rota), financeiro)).as(rota).isEqualTo(PROIBIDO);
        }
    }

    @Test
    @DisplayName("estorno: financeiro e direção entram pelo perfil, e a secretaria fica de fora")
    void estornoPelosPerfis() throws Exception {
        assertThat(status(post(ESTORNO), user("financeiro").roles("FINANCEIRO"))).isNotEqualTo(PROIBIDO);
        assertThat(status(post(ESTORNO), user("diretor").roles("DIRETOR"))).isNotEqualTo(PROIBIDO);
        assertThat(status(post(ESTORNO), user("admin").roles("ADMIN"))).isNotEqualTo(PROIBIDO);
        assertThat(status(post(ESTORNO), user("secretaria").roles("SECRETARIO"))).isEqualTo(PROIBIDO);
    }

    @Test
    @DisplayName("estorno: fora dos perfis, a tela não basta, e quem ganhou o controle entra (D39)")
    void estornoPeloControle() throws Exception {
        var professora = login(PerfilNome.PROFESSOR);
        var id = professora.getDadosPessoais().getId();
        assertThat(status(get("/financeiro/inadimplencia"), comoUsuario(professora))).isEqualTo(PROIBIDO);

        grupoService.salvarAcessosIndividuais(id, PerfilNome.PROFESSOR,
                new AcessosGrupoUsuarioDto(Set.of("SECRETARIA_FINANCEIRO"), Set.of()));
        assertThat(status(get("/financeiro/inadimplencia"), comoUsuario(professora))).isNotEqualTo(PROIBIDO);
        assertThat(status(post(ESTORNO), comoUsuario(professora))).isEqualTo(PROIBIDO);

        grupoService.salvarAcessosIndividuais(id, PerfilNome.PROFESSOR,
                new AcessosGrupoUsuarioDto(Set.of("SECRETARIA_FINANCEIRO"), Set.of("PAGAMENTO.ESTORNAR")));
        assertThat(status(post(ESTORNO), comoUsuario(professora))).isNotEqualTo(PROIBIDO);
    }

    @Test
    @DisplayName("aprovar preço: a secretaria fica de fora, e quem ganhou a tela de aprovação entra (D42)")
    void aprovacaoDePreco() throws Exception {
        assertThat(status(put(APROVAR_PRECO), user("financeiro").roles("FINANCEIRO"))).isNotEqualTo(PROIBIDO);
        assertThat(status(put(APROVAR_PRECO), user("diretor").roles("DIRETOR"))).isNotEqualTo(PROIBIDO);
        assertThat(status(put(APROVAR_PRECO), user("secretaria").roles("SECRETARIO"))).isEqualTo(PROIBIDO);

        var professora = login(PerfilNome.PROFESSOR);
        assertThat(status(put(APROVAR_PRECO), comoUsuario(professora))).isEqualTo(PROIBIDO);
        assertThat(status(get("/produto/precos/pendentes"), comoUsuario(professora))).isEqualTo(PROIBIDO);

        grupoService.salvarAcessosIndividuais(professora.getDadosPessoais().getId(), PerfilNome.PROFESSOR,
                new AcessosGrupoUsuarioDto(Set.of("SECRETARIA_APROVACAO_PRECO"), Set.of()));
        assertThat(status(put(APROVAR_PRECO), comoUsuario(professora))).isNotEqualTo(PROIBIDO);
        assertThat(status(get("/produto/precos/pendentes"), comoUsuario(professora))).isNotEqualTo(PROIBIDO);
    }

    @Test
    @DisplayName("catálogo: o coordenador só lê, e quem ganhou a tela escreve (D42)")
    void catalogo() throws Exception {
        var coordenador = user("coordenador").roles("COORDENADOR");
        assertThat(status(get("/produto"), coordenador)).isNotEqualTo(PROIBIDO);
        assertThat(status(post("/produto"), coordenador)).isEqualTo(PROIBIDO);

        var professora = login(PerfilNome.PROFESSOR);
        assertThat(status(post("/produto"), comoUsuario(professora))).isEqualTo(PROIBIDO);

        grupoService.salvarAcessosIndividuais(professora.getDadosPessoais().getId(), PerfilNome.PROFESSOR,
                new AcessosGrupoUsuarioDto(Set.of("SECRETARIA_CATALOGO"), Set.of()));
        assertThat(status(post("/produto"), comoUsuario(professora))).isNotEqualTo(PROIBIDO);
    }

    @Test
    @DisplayName("busca de pessoa por CPF: só quem cadastra, pelo perfil ou pela tela de cadastro (D42)")
    void buscaDePessoa() throws Exception {
        assertThat(status(get(PESSOA_EXISTENTE), user("secretaria").roles("SECRETARIO"))).isNotEqualTo(PROIBIDO);

        var professora = login(PerfilNome.PROFESSOR);
        assertThat(status(get(PESSOA_EXISTENTE), comoUsuario(professora))).isEqualTo(PROIBIDO);

        grupoService.salvarAcessosIndividuais(professora.getDadosPessoais().getId(), PerfilNome.PROFESSOR,
                new AcessosGrupoUsuarioDto(Set.of("ALUNO_CADASTRO", "ALUNO_DETALHE"), Set.of("ALUNO.DADOS_PESSOAIS.VER")));
        assertThat(status(get(PESSOA_EXISTENTE), comoUsuario(professora))).isNotEqualTo(PROIBIDO);
    }

    private int status(RequestPostProcessor quem) throws Exception {
        return status(get("/crm/estagios"), quem);
    }

    private int status(MockHttpServletRequestBuilder requisicao, RequestPostProcessor quem) throws Exception {
        return mvc.perform(requisicao.with(quem)).andReturn().getResponse().getStatus();
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
