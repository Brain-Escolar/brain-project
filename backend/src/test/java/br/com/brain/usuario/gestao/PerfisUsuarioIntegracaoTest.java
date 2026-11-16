package br.com.brain.usuario.gestao;

import br.com.brain.autenticacao.DadosAutenticacao;
import br.com.brain.autenticacao.DadosAutenticacaoRepository;
import br.com.brain.dadosPessoais.DadosPessoais;
import br.com.brain.dadosPessoais.DadosPessoaisRepository;
import br.com.brain.enums.PerfilNome;
import br.com.brain.exception.ErrosSistema;
import br.com.brain.infra.email.EmailService;
import br.com.brain.perfil.PerfilRepository;
import br.com.brain.permissao.GrupoPadraoService;
import br.com.brain.permissao.GrupoUsuarioService;
import br.com.brain.permissao.PermissoesUsuarioService;
import br.com.brain.permissao.dto.AcessosGrupoUsuarioDto;
import br.com.brain.permissao.dto.AdicaoMembrosDto;
import br.com.brain.permissao.dto.AtualizacaoGrupoUsuarioDto;
import br.com.brain.permissao.dto.CadastroGrupoUsuarioDto;
import br.com.brain.permissao.dto.MembroGrupoDto;
import br.com.brain.secretario.SecretarioRepository;
import br.com.brain.usuario.UsuarioService;
import br.com.brain.usuario.gestao.dto.AcessoDoPerfilDto;
import br.com.brain.usuario.gestao.dto.ControleEfetivoDto;
import br.com.brain.usuario.gestao.dto.GrupoDoUsuarioDto;
import br.com.brain.usuario.gestao.dto.OrigemAcessoDto;
import br.com.brain.usuario.gestao.dto.PerfilDeFuncaoDto;
import br.com.brain.usuario.gestao.dto.TelaEfetivaDto;

import java.util.Arrays;
import java.util.Set;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Tela de Usuários, fatia 2 (docs/permissoes.md, seção 8.7): acesso efetivo e
 * conceder ou remover perfil (RU3 a RU6, RU9, RU10). Cada teste roda numa
 * transação desfeita no fim.
 */
@SpringBootTest
@Transactional
@DisplayName("Tela de Usuários: perfis e acesso efetivo (com banco)")
class PerfisUsuarioIntegracaoTest {

    @Autowired
    private GestaoUsuariosService gestaoService;
    @Autowired
    private PerfisUsuarioService service;
    @Autowired
    private PermissoesUsuarioService permissoesService;
    @Autowired
    private GrupoUsuarioService grupoService;
    @Autowired
    private GrupoPadraoService grupoPadraoService;
    @Autowired
    private UsuarioService usuarioService;
    @Autowired
    private SecretarioRepository secretarioRepository;
    @Autowired
    private DadosPessoaisRepository dadosPessoaisRepository;
    @Autowired
    private DadosAutenticacaoRepository loginRepository;
    @Autowired
    private PerfilRepository perfilRepository;

    @MockitoBean
    private EmailService emailService;

    // ------------------------------------------------------------ acesso efetivo

    @Test
    @DisplayName("o acesso efetivo dá os mesmos códigos do cálculo de quem está logado, com a origem de cada um")
    void acessoEfetivoBateComOCalculo() {
        var diretor = login("Diretora", PerfilNome.DIRETOR);
        var ana = login("Ana", PerfilNome.SECRETARIO);
        grupoPadraoService.vincular(ana.getDadosPessoais(), PerfilNome.SECRETARIO);
        // Fora do teto da secretaria: só o acesso individual dá.
        grupoService.salvarAcessosIndividuais(idDe(ana), PerfilNome.SECRETARIO,
                new AcessosGrupoUsuarioDto(Set.of("ALUNO_LISTA", "ALUNO_DETALHE"), Set.of("SITUACAO_FAMILIAR.VER")));

        var bloco = bloco(gestaoService.acessoEfetivo(idDe(ana), diretor).perfis(), PerfilNome.SECRETARIO);
        var calculado = permissoesService.doUsuario(ana).perfis().get(PerfilNome.SECRETARIO);

        assertThat(bloco.telas()).extracting(TelaEfetivaDto::codigo)
                .containsExactlyInAnyOrderElementsOf(calculado.telas());
        assertThat(bloco.controles()).extracting(ControleEfetivoDto::codigo)
                .containsExactlyInAnyOrderElementsOf(calculado.controles());
        var sensivel = bloco.controles().stream().filter(c -> c.codigo().equals("SITUACAO_FAMILIAR.VER")).findFirst()
                .orElseThrow();
        assertThat(sensivel.origens()).containsExactly(OrigemAcessoDto.INDIVIDUAL);
        assertThat(sensivel.sensivel()).isTrue();
        assertThat(tela(bloco, "ALUNO_DETALHE").origens()).contains(OrigemAcessoDto.INDIVIDUAL);
        assertThat(bloco.telas()).anySatisfy(t -> assertThat(t.origens())
                .extracting(OrigemAcessoDto::tipo).containsExactly(OrigemAcessoDto.Tipo.GRUPO));
        assertThat(bloco.acessoIndividual()).isTrue();
        assertThat(bloco.servidor()).extracting("nome").contains("CRM de matrículas");
    }

    @Test
    @DisplayName("o ADMIN recebe o teto inteiro, sem grupo; grupo inativo aparece e não soma")
    void adminEGrupoInativo() {
        var admin = login("Admin", PerfilNome.ADMIN);
        var beto = login("Beto", PerfilNome.SECRETARIO, PerfilNome.ADMIN);
        var grupo = grupoService.cadastrar(new CadastroGrupoUsuarioDto(PerfilNome.SECRETARIO, "Pausado " + marca(), null));
        grupoService.salvarAcessos(grupo.id(), new AcessosGrupoUsuarioDto(Set.of("SECRETARIA_CRM"), Set.of()));
        grupoService.adicionarMembros(grupo.id(), new AdicaoMembrosDto(Set.of(idDe(beto))));
        grupoService.atualizar(grupo.id(), new AtualizacaoGrupoUsuarioDto(grupo.nome(), null, false));

        var perfis = gestaoService.acessoEfetivo(idDe(beto), admin).perfis();

        var doAdmin = bloco(perfis, PerfilNome.ADMIN);
        assertThat(doAdmin.tetoDoAdmin()).isTrue();
        assertThat(doAdmin.telas()).isNotEmpty().allSatisfy(t ->
                assertThat(t.origens()).containsExactly(OrigemAcessoDto.TETO_ADMIN));
        var daSecretaria = bloco(perfis, PerfilNome.SECRETARIO);
        assertThat(daSecretaria.telas()).isEmpty();
        assertThat(daSecretaria.grupos()).extracting(GrupoDoUsuarioDto::ativo).containsExactly(false);
    }

    @Test
    @DisplayName("ver o acesso efetivo exige o controle: a secretaria não vê sem ele")
    void acessoEfetivoExigeControle() {
        var secretaria = login("Secretária", PerfilNome.SECRETARIO);
        var professor = login("Professor", PerfilNome.PROFESSOR);

        assertThatThrownBy(() -> gestaoService.acessoEfetivo(idDe(professor), secretaria))
                .isInstanceOf(ErrosSistema.AcessoNegadoException.class);
        var detalhe = gestaoService.detalhar(idDe(professor), secretaria);
        assertThat(detalhe.secoes().acessoEfetivo()).isFalse();
        assertThat(detalhe.secoes().perfis()).isFalse();
        assertThat(detalhe.perfisDeFuncao()).isEmpty();
    }

    // ------------------------------------------------------------ conceder

    @Test
    @DisplayName("conceder ORIENTADOR põe no grupo padrão, e a prévia avisa o dado sensível que ele traz (RU10)")
    void concederOrientador() {
        var diretor = login("Diretora", PerfilNome.DIRETOR);
        var professor = login("Professor", PerfilNome.PROFESSOR);

        var previa = service.previa(idDe(professor), PerfilNome.ORIENTADOR, diretor);
        assertThat(previa.concessao()).isTrue();
        assertThat(previa.bloqueio()).isNull();
        assertThat(previa.grupoPadrao()).isNotNull();
        assertThat(previa.gruposQueVoltam()).isEmpty();
        assertThat(previa.controles()).anySatisfy(c -> assertThat(c.sensivel()).isTrue());

        var detalhe = service.conceder(idDe(professor), PerfilNome.ORIENTADOR, diretor);

        assertThat(detalhe.perfis()).contains(PerfilNome.ORIENTADOR, PerfilNome.PROFESSOR);
        var bloco = bloco(gestaoService.acessoEfetivo(idDe(professor), diretor).perfis(), PerfilNome.ORIENTADOR);
        assertThat(bloco.grupos()).extracting(GrupoDoUsuarioDto::padrao).containsExactly(true);
        assertThat(bloco.controles()).extracting(ControleEfetivoDto::codigo)
                .containsExactlyInAnyOrderElementsOf(previa.controles().stream().map(ControleEfetivoDto::codigo).toList());
    }

    @Test
    @DisplayName("quem recebe o perfil de volta volta ao grupo restrito, e não ao padrão (RU3); remover guarda o vínculo (RU4)")
    void reconcederVoltaAoGrupoRestrito() {
        var diretor = login("Diretora", PerfilNome.DIRETOR);
        var carla = login("Carla", PerfilNome.PROFESSOR, PerfilNome.SECRETARIO);
        var restrito = grupoService.cadastrar(new CadastroGrupoUsuarioDto(PerfilNome.SECRETARIO, "Restrito " + marca(), null));
        grupoService.adicionarMembros(restrito.id(), new AdicaoMembrosDto(Set.of(idDe(carla))));

        service.remover(idDe(carla), PerfilNome.SECRETARIO, diretor);

        var acesso = gestaoService.acessoEfetivo(idDe(carla), diretor);
        assertThat(acesso.gruposGuardados()).extracting(GrupoDoUsuarioDto::nome).containsExactly(restrito.nome());
        assertThat(membro(restrito.id(), carla).semOPerfil()).isTrue();

        var previa = service.previa(idDe(carla), PerfilNome.SECRETARIO, diretor);
        assertThat(previa.gruposQueVoltam()).extracting(GrupoDoUsuarioDto::nome).containsExactly(restrito.nome());
        assertThat(previa.grupoPadrao()).isNull();

        service.conceder(idDe(carla), PerfilNome.SECRETARIO, diretor);

        var bloco = bloco(gestaoService.acessoEfetivo(idDe(carla), diretor).perfis(), PerfilNome.SECRETARIO);
        assertThat(bloco.grupos()).extracting(GrupoDoUsuarioDto::nome).containsExactly(restrito.nome());
        assertThat(membro(restrito.id(), carla).semOPerfil()).isFalse();
    }

    @Test
    @DisplayName("conceder SECRETARIO cria o registro do CRM; remover o mantém, mas tira a pessoa da equipe (RU9)")
    void secretarioNoCrm() {
        var diretor = login("Diretora", PerfilNome.DIRETOR);
        var davi = login("Davi", PerfilNome.PROFESSOR);

        assertThat(service.previa(idDe(davi), PerfilNome.SECRETARIO, diretor).criaCadastroSecretario()).isTrue();
        service.conceder(idDe(davi), PerfilNome.SECRETARIO, diretor);

        assertThat(secretarioRepository.existsByDadosPessoaisId(idDe(davi))).isTrue();
        assertThat(secretarioRepository.findAtendentes()).anySatisfy(s ->
                assertThat(s.getDadosPessoais().getId()).isEqualTo(idDe(davi)));
        assertThat(service.previa(idDe(davi), PerfilNome.SECRETARIO, diretor).leadsAtivos()).isZero();

        service.remover(idDe(davi), PerfilNome.SECRETARIO, diretor);

        assertThat(secretarioRepository.existsByDadosPessoaisId(idDe(davi))).isTrue();
        assertThat(secretarioRepository.findAtendentes()).noneSatisfy(s ->
                assertThat(s.getDadosPessoais().getId()).isEqualTo(idDe(davi)));
        // Conceder de novo não duplica o registro.
        service.conceder(idDe(davi), PerfilNome.SECRETARIO, diretor);
        assertThat(secretarioRepository.findAll()).filteredOn(s -> s.getDadosPessoais().getId().equals(idDe(davi)))
                .hasSize(1);
    }

    // ------------------------------------------------------------ travas

    @Test
    @DisplayName("perfil de funcionário não vai para quem só é aluno, e ESTUDANTE aparece sem ação (RU6)")
    void soAluno() {
        var diretor = login("Diretora", PerfilNome.DIRETOR);
        var aluno = login("Aluno", PerfilNome.ESTUDANTE);

        assertThatThrownBy(() -> service.conceder(idDe(aluno), PerfilNome.SECRETARIO, diretor))
                .isInstanceOf(ErrosSistema.OperacaoInvalidaException.class)
                .hasMessageContaining("aluno");
        var linhas = gestaoService.detalhar(idDe(aluno), diretor).perfisDeFuncao();
        assertThat(linha(linhas, PerfilNome.ESTUDANTE).podeAlterar()).isFalse();
        assertThat(linha(linhas, PerfilNome.ESTUDANTE).bloqueio()).contains("cadastro de origem");
        assertThat(linha(linhas, PerfilNome.SECRETARIO).podeAlterar()).isFalse();
    }

    @Test
    @DisplayName("não remove o único perfil (RU5)")
    void unicoPerfil() {
        var diretor = login("Diretora", PerfilNome.DIRETOR);
        var orientadora = login("Orientadora", PerfilNome.ORIENTADOR);

        assertThatThrownBy(() -> service.remover(idDe(orientadora), PerfilNome.ORIENTADOR, diretor))
                .isInstanceOf(ErrosSistema.OperacaoInvalidaException.class)
                .hasMessageContaining("desative o login");
    }

    @Test
    @DisplayName("ADMIN e DIRETOR, só o ADMIN concede (U13); ninguém mexe nos próprios perfis (RU1)")
    void soAdminConcedeDirecao() {
        var diretor = login("Diretora", PerfilNome.DIRETOR);
        var admin = login("Admin", PerfilNome.ADMIN);
        var professor = login("Professor", PerfilNome.PROFESSOR);

        assertThatThrownBy(() -> service.conceder(idDe(professor), PerfilNome.DIRETOR, diretor))
                .isInstanceOf(ErrosSistema.AcessoNegadoException.class);
        assertThat(gestaoService.detalhar(idDe(professor), diretor).perfisDeFuncao())
                .extracting(PerfilDeFuncaoDto::perfil).doesNotContain(PerfilNome.ADMIN);
        assertThat(service.conceder(idDe(professor), PerfilNome.DIRETOR, admin).perfis()).contains(PerfilNome.DIRETOR);

        assertThatThrownBy(() -> service.conceder(idDe(diretor), PerfilNome.ORIENTADOR, diretor))
                .isInstanceOf(ErrosSistema.AcessoNegadoException.class)
                .hasMessageContaining("próprio acesso");
    }

    @Test
    @DisplayName("tirar o ADMIN do último administrador ativo é recusado (RU7)")
    void ultimoAdmin() {
        var admin = login("Admin", PerfilNome.ADMIN);
        var outro = login("Outro admin", PerfilNome.ADMIN, PerfilNome.DIRETOR);
        admin.setAtivo(false);
        loginRepository.save(admin);
        // Os ADMIN da base de testes, se houver, não podem contar.
        loginRepository.findAll().stream()
                .filter(l -> !l.getId().equals(outro.getId()) && AcessoGestaoUsuarios.perfis(l).contains(PerfilNome.ADMIN))
                .forEach(l -> {
                    l.setAtivo(false);
                    loginRepository.save(l);
                });
        var terceiro = login("Terceiro admin", PerfilNome.ADMIN);

        // O terceiro está ativo: tirar o ADMIN do outro passa.
        service.remover(idDe(outro), PerfilNome.ADMIN, terceiro);
        usuarioService.concederPerfil(outro.getDadosPessoais(), PerfilNome.ADMIN, null);
        terceiro.setAtivo(false);
        loginRepository.save(terceiro);

        assertThatThrownBy(() -> service.remover(idDe(outro), PerfilNome.ADMIN, terceiro))
                .isInstanceOf(ErrosSistema.OperacaoInvalidaException.class)
                .hasMessageContaining("sem nenhum administrador");
    }

    @Test
    @DisplayName("a prévia de remover avisa quando a pessoa é a última com o perfil (RU10)")
    void ultimaComPerfil() {
        var diretor = login("Diretora", PerfilNome.DIRETOR);
        var pessoa = login("Pessoa", PerfilNome.PROFESSOR, PerfilNome.ORIENTADOR);
        loginRepository.findAll().stream()
                .filter(l -> !l.getId().equals(pessoa.getId())
                        && AcessoGestaoUsuarios.perfis(l).contains(PerfilNome.ORIENTADOR))
                .forEach(l -> {
                    l.setAtivo(false);
                    loginRepository.save(l);
                });

        assertThat(service.previa(idDe(pessoa), PerfilNome.ORIENTADOR, diretor).ultimaComPerfil()).isTrue();
        login("Outra orientadora", PerfilNome.ORIENTADOR);
        assertThat(service.previa(idDe(pessoa), PerfilNome.ORIENTADOR, diretor).ultimaComPerfil()).isFalse();
    }

    // ------------------------------------------------------------ apoio

    private MembroGrupoDto membro(Long grupoId, DadosAutenticacao login) {
        return grupoService.buscarMembros(grupoId, null, PageRequest.of(0, 50)).getContent().stream()
                .filter(m -> m.dadosPessoaisId().equals(idDe(login)))
                .findFirst().orElseThrow();
    }

    private static AcessoDoPerfilDto bloco(java.util.List<AcessoDoPerfilDto> perfis, PerfilNome perfil) {
        return perfis.stream().filter(b -> b.perfil() == perfil).findFirst().orElseThrow();
    }

    private static TelaEfetivaDto tela(AcessoDoPerfilDto bloco, String codigo) {
        return bloco.telas().stream().filter(t -> t.codigo().equals(codigo)).findFirst().orElseThrow();
    }

    private static PerfilDeFuncaoDto linha(java.util.List<PerfilDeFuncaoDto> linhas, PerfilNome perfil) {
        return linhas.stream().filter(l -> l.perfil() == perfil).findFirst().orElseThrow();
    }

    private static String marca() {
        return UUID.randomUUID().toString().substring(0, 6);
    }

    private static Long idDe(DadosAutenticacao login) {
        return login.getDadosPessoais().getId();
    }

    private DadosAutenticacao login(String nome, PerfilNome... perfis) {
        var sufixo = UUID.randomUUID().toString().substring(0, 8);
        var dados = new DadosPessoais();
        dados.setNome(nome + " " + sufixo);
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
