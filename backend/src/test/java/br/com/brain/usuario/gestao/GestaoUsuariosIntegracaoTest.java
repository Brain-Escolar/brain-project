package br.com.brain.usuario.gestao;

import br.com.brain.autenticacao.DadosAutenticacao;
import br.com.brain.autenticacao.DadosAutenticacaoRepository;
import br.com.brain.autenticacao.MotivoDesativacao;
import br.com.brain.autenticacao.SituacaoLogin;
import br.com.brain.dadosPessoais.DadosPessoais;
import br.com.brain.dadosPessoais.DadosPessoaisRepository;
import br.com.brain.enums.PerfilNome;
import br.com.brain.exception.ErrosSistema;
import br.com.brain.infra.email.EmailService;
import br.com.brain.perfil.PerfilRepository;
import br.com.brain.permissao.GrupoPadraoService;
import br.com.brain.permissao.GrupoUsuarioService;
import br.com.brain.permissao.dto.AcessosGrupoUsuarioDto;
import br.com.brain.permissao.dto.AtualizacaoGrupoUsuarioDto;
import br.com.brain.permissao.dto.CadastroGrupoUsuarioDto;
import br.com.brain.permissao.dto.AdicaoMembrosDto;
import br.com.brain.usuario.UsuarioService;
import br.com.brain.usuario.gestao.dto.FiltroUsuariosDto;
import br.com.brain.usuario.gestao.dto.GrupoDoUsuarioDto;
import br.com.brain.usuario.gestao.dto.UsuarioListaDto;

import java.util.Arrays;
import java.util.Set;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.timeout;
import static org.mockito.Mockito.verify;

/**
 * Tela de Usuários, fatia 1 (docs/permissoes.md, seção 8.7): lista, alcance
 * (RU1, RU2), controle de login e motivo da desativação (RU8). Cada teste roda
 * numa transação desfeita no fim.
 */
@SpringBootTest
@Transactional
@DisplayName("Tela de Usuários (com banco)")
class GestaoUsuariosIntegracaoTest {

    private static final PageRequest PAGINA = PageRequest.of(0, 50, Sort.by("dadosPessoais.nome"));

    @Autowired
    private GestaoUsuariosService service;
    @Autowired
    private GrupoUsuarioService grupoService;
    @Autowired
    private GrupoPadraoService grupoPadraoService;
    @Autowired
    private UsuarioService usuarioService;
    @Autowired
    private DadosPessoaisRepository dadosPessoaisRepository;
    @Autowired
    private DadosAutenticacaoRepository loginRepository;
    @Autowired
    private PerfilRepository perfilRepository;

    @MockitoBean
    private EmailService emailService;

    // ------------------------------------------------------------ lista

    @Test
    @DisplayName("a busca acha por nome, nome social e login, e o filtro de perfil restringe")
    void buscaEPerfil() {
        var marca = marca();
        var ana = login("Ana " + marca, PerfilNome.SECRETARIO);
        var bia = login("Beatriz " + marca, PerfilNome.PROFESSOR);
        bia.getDadosPessoais().setNomeSocial("Bia Social " + marca);

        assertThat(nomes(filtro(marca, null, null))).containsExactly("Ana " + marca, "Beatriz " + marca);
        assertThat(nomes(filtro("bia social " + marca.toLowerCase(), null, null))).containsExactly("Beatriz " + marca);
        assertThat(nomes(filtro(ana.getEmail().toUpperCase(), null, null))).containsExactly("Ana " + marca);
        assertThat(nomes(filtro(marca, PerfilNome.PROFESSOR, null))).containsExactly("Beatriz " + marca);
    }

    @Test
    @DisplayName("quem não tem grupo ativo num perfil aparece como sem acesso nele; o ADMIN nunca")
    void semAcesso() {
        var marca = marca();
        var carla = login("Carla " + marca, PerfilNome.SECRETARIO, PerfilNome.ADMIN);
        var davi = login("Davi " + marca, PerfilNome.SECRETARIO);
        grupoPadraoService.vincular(davi.getDadosPessoais(), PerfilNome.SECRETARIO);

        var linhaCarla = linha(carla);
        assertThat(linhaCarla.perfisSemAcesso()).containsExactly(PerfilNome.SECRETARIO);
        assertThat(linha(davi).perfisSemAcesso()).isEmpty();
        assertThat(nomes(new FiltroUsuariosDto(marca, null, null, null, true, null))).containsExactly("Carla " + marca);
    }

    @Test
    @DisplayName("grupo inativo aparece marcado e não conta como acesso")
    void grupoInativo() {
        var marca = marca();
        var eva = login("Eva " + marca, PerfilNome.SECRETARIO);
        var grupo = grupoService.cadastrar(new CadastroGrupoUsuarioDto(PerfilNome.SECRETARIO, "Temporário " + marca, null));
        grupoService.adicionarMembros(grupo.id(), new AdicaoMembrosDto(Set.of(idDe(eva))));
        grupoService.atualizar(grupo.id(), new AtualizacaoGrupoUsuarioDto("Temporário " + marca, null, false));

        var linha = linha(eva);

        assertThat(linha.grupos()).extracting(GrupoDoUsuarioDto::nome, GrupoDoUsuarioDto::ativo)
                .containsExactly(org.assertj.core.groups.Tuple.tuple("Temporário " + marca, false));
        assertThat(linha.perfisSemAcesso()).containsExactly(PerfilNome.SECRETARIO);
        assertThat(nomes(new FiltroUsuariosDto(marca, null, grupo.id(), null, null, null))).containsExactly("Eva " + marca);
    }

    @Test
    @DisplayName("o acesso individual não aparece como grupo: vira o selo e o filtro próprio")
    void acessoIndividual() {
        var marca = marca();
        var fabio = login("Fábio " + marca, PerfilNome.SECRETARIO);
        login("Gabi " + marca, PerfilNome.SECRETARIO);
        grupoService.salvarAcessosIndividuais(idDe(fabio), PerfilNome.SECRETARIO,
                new AcessosGrupoUsuarioDto(Set.of("CALENDARIO"), Set.of()));

        var linha = linha(fabio);

        assertThat(linha.grupos()).isEmpty();
        assertThat(linha.perfisComAcessoIndividual()).containsExactly(PerfilNome.SECRETARIO);
        assertThat(linha.perfisSemAcesso()).isEmpty();
        assertThat(nomes(new FiltroUsuariosDto(marca, null, null, null, null, true))).containsExactly("Fábio " + marca);
    }

    @Test
    @DisplayName("situação do login: aguardando verificação, ativo e desativado, com filtro")
    void situacao() {
        var marca = marca();
        var hugo = login("Hugo " + marca, PerfilNome.PROFESSOR);
        var iris = login("Iris " + marca, PerfilNome.PROFESSOR);
        iris.setVerificado(false);
        iris.setAtivo(false);
        var joao = login("João " + marca, PerfilNome.ESTUDANTE);
        usuarioService.revogarPerfil(joao.getDadosPessoais(), PerfilNome.ESTUDANTE);

        assertThat(linha(hugo).situacao()).isEqualTo(SituacaoLogin.ATIVO);
        assertThat(linha(iris).situacao()).isEqualTo(SituacaoLogin.AGUARDANDO_VERIFICACAO);
        assertThat(linha(joao).situacao()).isEqualTo(SituacaoLogin.DESATIVADO);
        assertThat(linha(joao).motivoDesativacao()).isEqualTo(MotivoDesativacao.SEM_PERFIL);
        assertThat(nomes(new FiltroUsuariosDto(marca, null, null, SituacaoLogin.DESATIVADO, null, null)))
                .containsExactly("João " + marca);
        assertThat(nomes(new FiltroUsuariosDto(marca, null, null, SituacaoLogin.AGUARDANDO_VERIFICACAO, null, null)))
                .containsExactly("Iris " + marca);
    }

    // ------------------------------------------------------------ alcance e controle

    @Test
    @DisplayName("o diretor desativa e reativa um professor; a rematrícula não desfaz a desativação (RU8)")
    void diretorDesativaEReativa() {
        var diretor = login("Diretora", PerfilNome.DIRETOR);
        var professor = login("Professor", PerfilNome.PROFESSOR);

        var desativado = service.desativar(idDe(professor), diretor);
        assertThat(desativado.situacao()).isEqualTo(SituacaoLogin.DESATIVADO);
        assertThat(desativado.motivoDesativacao()).isEqualTo(MotivoDesativacao.ADMINISTRATIVA);
        assertThat(desativado.acoes().reativar()).isTrue();

        usuarioService.concederPerfil(professor.getDadosPessoais(), PerfilNome.RESPONSAVEL, "x");
        assertThat(professor.getAtivo()).isFalse();

        var reativado = service.reativar(idDe(professor), diretor);
        assertThat(reativado.situacao()).isEqualTo(SituacaoLogin.ATIVO);
    }

    @Test
    @DisplayName("quem ficou sem perfil não é reativado pela tela")
    void naoReativaSemPerfil() {
        var diretor = login("Diretora", PerfilNome.DIRETOR);
        var aluno = login("Aluno", PerfilNome.ESTUDANTE);
        usuarioService.revogarPerfil(aluno.getDadosPessoais(), PerfilNome.ESTUDANTE);

        assertThatThrownBy(() -> service.reativar(idDe(aluno), diretor))
                .isInstanceOf(ErrosSistema.OperacaoInvalidaException.class)
                .hasMessageContaining("sem nenhum perfil");
    }

    @Test
    @DisplayName("ninguém desativa o próprio login (RU1)")
    void naoAgeSobreSiMesmo() {
        var diretor = login("Diretora", PerfilNome.DIRETOR);

        assertThatThrownBy(() -> service.desativar(idDe(diretor), diretor))
                .isInstanceOf(ErrosSistema.AcessoNegadoException.class)
                .hasMessageContaining("próprio acesso");
        assertThat(service.detalhar(idDe(diretor), diretor).acoes().bloqueio()).contains("próprio acesso");
    }

    @Test
    @DisplayName("dois degraus: o diretor não mexe no ADMIN, e o ADMIN mexe no diretor (RU2)")
    void doisDegraus() {
        var diretor = login("Diretora", PerfilNome.DIRETOR);
        var admin = login("Admin", PerfilNome.ADMIN);
        login("Outro admin", PerfilNome.ADMIN);

        assertThatThrownBy(() -> service.desativar(idDe(admin), diretor))
                .isInstanceOf(ErrosSistema.AcessoNegadoException.class)
                .hasMessageContaining("administrador");
        assertThat(service.desativar(idDe(diretor), admin).situacao()).isEqualTo(SituacaoLogin.DESATIVADO);
    }

    @Test
    @DisplayName("a secretaria só age com o controle, e nunca sobre a direção")
    void secretariaPeloControle() {
        var secretaria = login("Secretária", PerfilNome.SECRETARIO);
        var professor = login("Professor", PerfilNome.PROFESSOR);
        var diretor = login("Diretor", PerfilNome.DIRETOR);

        assertThatThrownBy(() -> service.desativar(idDe(professor), secretaria))
                .isInstanceOf(ErrosSistema.AcessoNegadoException.class);
        assertThat(service.detalhar(idDe(professor), secretaria).acoes().desativar()).isFalse();

        grupoService.salvarAcessosIndividuais(idDe(secretaria), PerfilNome.SECRETARIO,
                new AcessosGrupoUsuarioDto(Set.of("USUARIOS"), Set.of("USUARIO.LOGIN.GERENCIAR")));

        assertThat(service.desativar(idDe(professor), secretaria).situacao()).isEqualTo(SituacaoLogin.DESATIVADO);
        assertThatThrownBy(() -> service.desativar(idDe(diretor), secretaria))
                .isInstanceOf(ErrosSistema.AcessoNegadoException.class)
                .hasMessageContaining("direção");
    }

    @Test
    @DisplayName("a escola nunca fica sem ADMIN ativo e verificado (RU7)")
    void ultimoAdmin() {
        var admin = login("Admin", PerfilNome.ADMIN);
        var outro = login("Outro admin", PerfilNome.ADMIN);
        // Quem age só conta se estiver ativo; aqui ele já foi desligado em outra transação.
        admin.setAtivo(false);
        loginRepository.save(admin);

        assertThatThrownBy(() -> service.desativar(idDe(outro), admin))
                .isInstanceOf(ErrosSistema.OperacaoInvalidaException.class)
                .hasMessageContaining("sem nenhum administrador");
    }

    // ------------------------------------------------------------ e-mails

    @Test
    @DisplayName("sem e-mail pessoal, a redefinição pela gestão é bloqueada")
    void redefinicaoSemEmailPessoal() {
        var diretor = login("Diretora", PerfilNome.DIRETOR);
        var professor = login("Professor", PerfilNome.PROFESSOR);
        professor.getDadosPessoais().setEmail(" ");

        assertThat(service.detalhar(idDe(professor), diretor).acoes().enviarRedefinicao()).isFalse();
        assertThat(service.detalhar(idDe(professor), diretor).emailPessoalMascarado()).isNull();
        assertThatThrownBy(() -> service.enviarRedefinicao(idDe(professor), diretor))
                .hasMessageContaining("e-mail pessoal");
        verify(emailService, never()).enviarEmailLinkSenha(anyString(), anyString(), anyString(), anyString(),
                anyBoolean(), anyString());
    }

    @Test
    @DisplayName("a redefinição vai para o e-mail pessoal, e o reenvio da verificação só vale para quem não verificou")
    void enviosDeSenha() {
        var diretor = login("Diretora", PerfilNome.DIRETOR);
        var professor = login("Professor", PerfilNome.PROFESSOR);
        var pessoal = professor.getDadosPessoais().getEmail();

        service.enviarRedefinicao(idDe(professor), diretor);

        verify(emailService, timeout(2000)).enviarEmailLinkSenha(anyString(), eq(pessoal), eq(professor.getEmail()), anyString(),
                eq(false), eq("1 hora"));
        assertThat(professor.getTokenSenha()).isNotNull();
        assertThatThrownBy(() -> service.reenviarVerificacao(idDe(professor), diretor))
                .hasMessageContaining("já foi verificado");
        assertThat(service.detalhar(idDe(professor), diretor).emailPessoalMascarado()).startsWith("pe").endsWith("@pessoal.test");
    }

    @Test
    @DisplayName("e-mail mascarado mostra só o começo e o domínio")
    void mascara() {
        assertThat(GestaoUsuariosService.mascarar("ana.souza@gmail.com")).isEqualTo("an*******@gmail.com");
        assertThat(GestaoUsuariosService.mascarar("ab@x.com")).isEqualTo("a***@x.com");
        assertThat(GestaoUsuariosService.mascarar(null)).isNull();
    }

    // ------------------------------------------------------------ apoio

    private java.util.List<String> nomes(FiltroUsuariosDto filtro) {
        return service.listar(filtro, PAGINA).getContent().stream().map(UsuarioListaDto::nome).toList();
    }

    private static FiltroUsuariosDto filtro(String busca, PerfilNome perfil, Long grupoId) {
        return new FiltroUsuariosDto(busca, perfil, grupoId, null, null, null);
    }

    private UsuarioListaDto linha(DadosAutenticacao login) {
        return service.listar(filtro(login.getEmail(), null, null), PAGINA).getContent().getFirst();
    }

    private static String marca() {
        return "Marca" + UUID.randomUUID().toString().substring(0, 6);
    }

    private static Long idDe(DadosAutenticacao login) {
        return login.getDadosPessoais().getId();
    }

    private DadosAutenticacao login(String nome, PerfilNome... perfis) {
        var sufixo = UUID.randomUUID().toString().substring(0, 8);
        var dados = new DadosPessoais();
        dados.setNome(nome);
        dados.setEmail("pessoa-" + sufixo + "@pessoal.test");
        Arrays.stream(perfis).forEach(perfil -> dados.getPerfis().add(perfilRepository.findByNome(perfil)));
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
