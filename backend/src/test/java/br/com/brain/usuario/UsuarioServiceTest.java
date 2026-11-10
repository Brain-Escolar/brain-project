package br.com.brain.usuario;

import br.com.brain.autenticacao.DadosAutenticacao;
import br.com.brain.autenticacao.DadosAutenticacaoRepository;
import br.com.brain.dadosPessoais.DadosPessoais;
import br.com.brain.enums.PerfilNome;
import br.com.brain.infra.email.EmailService;
import br.com.brain.perfil.Perfil;
import br.com.brain.perfil.PerfilRepository;
import br.com.brain.permissao.GrupoPadraoService;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/**
 * Uma pessoa, um login, varios papeis: desligar um papel nao pode derrubar
 * os outros (o professor desligado que e responsavel segue no portal).
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("UsuarioService - perfis")
class UsuarioServiceTest {

    @Mock
    private PerfilRepository perfilRepository;
    @Mock
    private DadosAutenticacaoRepository usuarioRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private EmailService emailService;
    @Mock
    private GrupoPadraoService grupoPadraoService;
    @Mock
    private EntityManager em;

    private UsuarioService service;
    private DadosPessoais pessoa;
    private DadosAutenticacao login;

    @BeforeEach
    void setUp() {
        service = new UsuarioService(perfilRepository, usuarioRepository, passwordEncoder, emailService, grupoPadraoService);
        ReflectionTestUtils.setField(service, "em", em);

        pessoa = new DadosPessoais();
        pessoa.setId(1L);
        login = new DadosAutenticacao();
        login.setVerificado(true);
        login.setAtivo(true);
        lenient().when(usuarioRepository.findByDadosPessoaisId(1L)).thenReturn(Optional.of(login));
    }

    private static Perfil perfil(PerfilNome nome) {
        var perfil = new Perfil();
        perfil.setNome(nome);
        return perfil;
    }

    @Test
    @DisplayName("revogar um de dois papeis: tira o perfil e mantem o login ativo")
    void revogarUmDeDoisMantemLogin() {
        pessoa.getPerfis().add(perfil(PerfilNome.PROFESSOR));
        pessoa.getPerfis().add(perfil(PerfilNome.RESPONSAVEL));

        service.revogarPerfil(pessoa, PerfilNome.PROFESSOR);

        assertThat(pessoa.getPerfis()).extracting(Perfil::getNome).containsExactly(PerfilNome.RESPONSAVEL);
        assertThat(login.getAtivo()).isTrue();
    }

    @Test
    @DisplayName("revogar o unico papel: desativa o login")
    void revogarUnicoDesativaLogin() {
        pessoa.getPerfis().add(perfil(PerfilNome.ESTUDANTE));

        service.revogarPerfil(pessoa, PerfilNome.ESTUDANTE);

        assertThat(pessoa.getPerfis()).isEmpty();
        assertThat(login.getAtivo()).isFalse();
    }

    @Test
    @DisplayName("conceder de volta: devolve o perfil e reativa o login verificado")
    void concederReativaLoginVerificado() {
        login.setAtivo(false);
        when(perfilRepository.findByNome(PerfilNome.PROFESSOR)).thenReturn(perfil(PerfilNome.PROFESSOR));

        service.concederPerfil(pessoa, PerfilNome.PROFESSOR, "senha");

        assertThat(pessoa.getPerfis()).extracting(Perfil::getNome).containsExactly(PerfilNome.PROFESSOR);
        assertThat(login.getAtivo()).isTrue();
    }

    @Test
    @DisplayName("conceder a quem nao confirmou o e-mail: nao ativa o login por fora do link")
    void concederNaoAtivaLoginNaoVerificado() {
        login.setVerificado(false);
        login.setAtivo(false);
        when(perfilRepository.findByNome(PerfilNome.RESPONSAVEL)).thenReturn(perfil(PerfilNome.RESPONSAVEL));

        service.concederPerfil(pessoa, PerfilNome.RESPONSAVEL, "senha");

        assertThat(login.getAtivo()).isFalse();
    }

    @Test
    @DisplayName("conceder perfil novo a quem ja tem login: entra no grupo padrao do perfil (D2)")
    void concederVinculaAoGrupoPadrao() {
        when(perfilRepository.findByNome(PerfilNome.RESPONSAVEL)).thenReturn(perfil(PerfilNome.RESPONSAVEL));

        service.concederPerfil(pessoa, PerfilNome.RESPONSAVEL, "senha");

        verify(grupoPadraoService).vincular(pessoa, PerfilNome.RESPONSAVEL);
    }

    @Test
    @DisplayName("conceder perfil que a pessoa ja tem: nao mexe nos grupos dela")
    void concederRepetidoNaoVincula() {
        pessoa.getPerfis().add(perfil(PerfilNome.RESPONSAVEL));

        service.concederPerfil(pessoa, PerfilNome.RESPONSAVEL, "senha");

        verifyNoInteractions(grupoPadraoService);
    }
}
