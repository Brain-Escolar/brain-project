package br.com.brain.usuario;

import br.com.brain.autenticacao.DadosAutenticacao;
import br.com.brain.autenticacao.DadosAutenticacaoRepository;
import br.com.brain.dadosPessoais.DadosPessoais;
import br.com.brain.dadosPessoais.DadosPessoaisRepository;
import br.com.brain.enums.PerfilNome;
import br.com.brain.exception.ErrosSistema;
import br.com.brain.infra.email.EmailService;
import br.com.brain.infra.multitenancy.TenantContext;
import br.com.brain.perfil.PerfilRepository;
import br.com.brain.usuario.dto.NovaSenhaDto;

import java.util.UUID;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.after;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.timeout;
import static org.mockito.Mockito.verify;

/**
 * Link de definir e redefinir senha (docs/permissoes.md, D48) e o "Esqueci a
 * senha" (F5). O e-mail é um mock: o teste pega o token que iria no link.
 */
@SpringBootTest
@Transactional
@DisplayName("Link de senha (com banco)")
class LinkDeSenhaIntegracaoTest {

    private static final String ESCOLA = "escola_teste";

    @Autowired
    private LinkDeSenhaService linkService;
    @Autowired
    private UsuarioService usuarioService;
    @Autowired
    private DadosPessoaisRepository dadosPessoaisRepository;
    @Autowired
    private DadosAutenticacaoRepository loginRepository;
    @Autowired
    private PerfilRepository perfilRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @MockitoBean
    private EmailService emailService;

    @BeforeEach
    void escola() {
        TenantContext.setTenantId(ESCOLA);
    }

    @AfterEach
    void limpar() {
        TenantContext.clear();
    }

    @Test
    @DisplayName("esqueci a senha: o link vai para o e-mail pessoal, troca a senha e só vale uma vez")
    void redefinir() {
        var login = login();

        usuarioService.esqueciMinhaSenha(login.getEmail().toUpperCase());
        var token = tokenEnviado(login.getDadosPessoais().getEmail(), false);

        assertThat(linkService.informacao(token).finalidade()).isEqualTo(LinkDeSenhaService.Finalidade.REDEFINIR);
        linkService.definirSenha(new NovaSenhaDto(token, "senha-nova-1", "senha-nova-1"));

        assertThat(passwordEncoder.matches("senha-nova-1", login.getSenha())).isTrue();
        assertThatThrownBy(() -> linkService.definirSenha(new NovaSenhaDto(token, "outra-senha", "outra-senha")))
                .isInstanceOf(ErrosSistema.TokenInvalidoOuExpiradoException.class);
    }

    @Test
    @DisplayName("quem não verificou recebe o link de definir senha, que também verifica e ativa")
    void definir() {
        var login = login();
        login.setVerificado(false);
        login.setAtivo(false);

        usuarioService.esqueciMinhaSenha(login.getEmail());
        var token = tokenEnviado(login.getDadosPessoais().getEmail(), true);
        linkService.definirSenha(new NovaSenhaDto(token, "primeira-senha", "primeira-senha"));

        assertThat(login.getVerificado()).isTrue();
        assertThat(login.getAtivo()).isTrue();
    }

    @Test
    @DisplayName("um link novo invalida o anterior, e desativar o login invalida o link")
    void invalidacao() {
        var login = login();
        linkService.enviar(login, LinkDeSenhaService.Finalidade.REDEFINIR);
        var primeiro = tokenEnviado(login.getDadosPessoais().getEmail(), false);
        linkService.enviar(login, LinkDeSenhaService.Finalidade.REDEFINIR);

        assertThatThrownBy(() -> linkService.informacao(primeiro))
                .isInstanceOf(ErrosSistema.TokenInvalidoOuExpiradoException.class);

        login.desativarAdministrativamente();
        assertThat(login.getTokenSenha()).isNull();
    }

    @Test
    @DisplayName("o link de uma escola não vale em outra")
    void outraEscola() {
        var login = login();
        linkService.enviar(login, LinkDeSenhaService.Finalidade.REDEFINIR);
        var token = tokenEnviado(login.getDadosPessoais().getEmail(), false);

        TenantContext.setTenantId("outra_escola");

        assertThatThrownBy(() -> linkService.informacao(token))
                .isInstanceOf(ErrosSistema.TokenInvalidoOuExpiradoException.class);
    }

    @Test
    @DisplayName("esqueci a senha não manda nada para login desativado, inexistente ou sem e-mail pessoal")
    void esqueciSemEnvio() {
        var desativado = login();
        desativado.desativarAdministrativamente();
        var semEmail = login();
        semEmail.getDadosPessoais().setEmail("");

        usuarioService.esqueciMinhaSenha(desativado.getEmail());
        usuarioService.esqueciMinhaSenha(semEmail.getEmail());
        usuarioService.esqueciMinhaSenha("ninguem@escola.test");

        verify(emailService, after(300).never()).enviarEmailLinkSenha(anyString(), anyString(), anyString(),
                anyString(), anyBoolean(), anyString());
    }

    @Test
    @DisplayName("o link de verificação não religa um login desativado (F4)")
    void verificacaoNaoReativa() {
        var login = login();
        login.setVerificado(false);
        login.setAtivo(false);
        login.desativarAdministrativamente();

        login.verificar();

        assertThat(login.getVerificado()).isTrue();
        assertThat(login.getAtivo()).isFalse();
    }

    private String tokenEnviado(String para, boolean primeiroAcesso) {
        var token = ArgumentCaptor.forClass(String.class);
        verify(emailService, timeout(2000).atLeastOnce()).enviarEmailLinkSenha(anyString(), eq(para), anyString(),
                token.capture(), eq(primeiroAcesso), anyString());
        return token.getValue();
    }

    private DadosAutenticacao login() {
        var sufixo = UUID.randomUUID().toString().substring(0, 8);
        var dados = new DadosPessoais();
        dados.setNome("Pessoa " + sufixo);
        dados.setEmail("pessoa-" + sufixo + "@pessoal.test");
        dados.getPerfis().add(perfilRepository.findByNome(PerfilNome.PROFESSOR));
        var salvo = dadosPessoaisRepository.save(dados);

        var login = new DadosAutenticacao();
        login.setEmail("login-" + sufixo + "@escola.test");
        login.setSenha(passwordEncoder.encode("senha-antiga"));
        login.setVerificado(true);
        login.setAtivo(true);
        login.setDadosPessoais(salvo);
        return loginRepository.save(login);
    }
}
