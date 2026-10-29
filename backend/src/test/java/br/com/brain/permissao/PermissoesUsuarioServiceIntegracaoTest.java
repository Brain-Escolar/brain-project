package br.com.brain.permissao;

import br.com.brain.autenticacao.DadosAutenticacao;
import br.com.brain.autenticacao.DadosAutenticacaoRepository;
import br.com.brain.dadosPessoais.DadosPessoais;
import br.com.brain.dadosPessoais.DadosPessoaisRepository;
import br.com.brain.enums.PerfilNome;
import br.com.brain.perfil.PerfilRepository;
import br.com.brain.permissao.dto.AcessosGrupoUsuarioDto;
import br.com.brain.permissao.dto.AdicaoMembrosDto;
import br.com.brain.permissao.dto.AtualizacaoGrupoUsuarioDto;
import br.com.brain.permissao.dto.CadastroGrupoUsuarioDto;
import br.com.brain.usuario.UsuarioService;

import java.util.Set;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * GET /permissoes/me contra o banco: o seed da V111 e as regras RP1 e RP4 da
 * spec. Cada teste roda numa transação desfeita no fim.
 */
@SpringBootTest
@Transactional
@DisplayName("PermissoesUsuarioService (com banco)")
class PermissoesUsuarioServiceIntegracaoTest {

    @Autowired
    private PermissoesUsuarioService service;
    @Autowired
    private GrupoPadraoService grupoPadraoService;
    @Autowired
    private GrupoUsuarioService grupoService;
    @Autowired
    private UsuarioService usuarioService;
    @Autowired
    private GrupoUsuarioRepository grupoRepository;
    @Autowired
    private GrupoUsuarioMembroRepository membroRepository;
    @Autowired
    private DadosPessoaisRepository dadosPessoaisRepository;
    @Autowired
    private DadosAutenticacaoRepository dadosAutenticacaoRepository;
    @Autowired
    private PerfilRepository perfilRepository;
    @Autowired
    private JdbcTemplate jdbc;

    @Test
    @DisplayName("quem está no grupo padrão recebe o que o perfil acessa hoje")
    void grupoPadrao() {
        var secretaria = login(PerfilNome.SECRETARIO);
        grupoPadraoService.vincular(secretaria.getDadosPessoais(), PerfilNome.SECRETARIO);

        var permissoes = service.doUsuario(secretaria);

        assertThat(permissoes.gerenciaPermissoes()).isFalse();
        assertThat(permissoes.perfis()).containsOnlyKeys(PerfilNome.SECRETARIO);
        assertThat(permissoes.perfis().get(PerfilNome.SECRETARIO).telas()).hasSize(11).contains("SECRETARIA_CRM");
        assertThat(permissoes.perfis().get(PerfilNome.SECRETARIO).controles()).hasSize(5);
    }

    @Test
    @DisplayName("sem grupo, o perfil vem sem telas nem controles")
    void semGrupo() {
        var permissoes = service.doUsuario(login(PerfilNome.SECRETARIO));

        assertThat(permissoes.perfis().get(PerfilNome.SECRETARIO).telas()).isEmpty();
        assertThat(permissoes.perfis().get(PerfilNome.SECRETARIO).controles()).isEmpty();
    }

    @Test
    @DisplayName("grupo inativo não concede nada")
    void grupoInativo() {
        var secretaria = login(PerfilNome.SECRETARIO);
        var grupo = grupoService.cadastrar(new CadastroGrupoUsuarioDto(PerfilNome.SECRETARIO, "Só CRM", null));
        grupoService.salvarAcessos(grupo.id(), new AcessosGrupoUsuarioDto(Set.of("SECRETARIA_CRM"), Set.of()));
        grupoService.adicionarMembros(grupo.id(), new AdicaoMembrosDto(Set.of(secretaria.getDadosPessoais().getId())));
        assertThat(service.doUsuario(secretaria).perfis().get(PerfilNome.SECRETARIO).telas())
                .containsExactly("SECRETARIA_CRM");

        grupoService.atualizar(grupo.id(), new AtualizacaoGrupoUsuarioDto("Só CRM", null, false));

        assertThat(service.doUsuario(secretaria).perfis().get(PerfilNome.SECRETARIO).telas()).isEmpty();
    }

    @Test
    @DisplayName("grupo de um perfil que a pessoa perdeu não concede nada")
    void perfilPerdido() {
        var pessoa = login(PerfilNome.SECRETARIO, PerfilNome.PROFESSOR);
        grupoPadraoService.vincular(pessoa.getDadosPessoais(), PerfilNome.SECRETARIO);
        grupoPadraoService.vincular(pessoa.getDadosPessoais(), PerfilNome.PROFESSOR);

        pessoa.getDadosPessoais().getPerfis().removeIf(perfil -> perfil.getNome() == PerfilNome.SECRETARIO);

        assertThat(service.doUsuario(pessoa).perfis()).containsOnlyKeys(PerfilNome.PROFESSOR);
    }

    @Test
    @DisplayName("quem tem dois perfis recebe as permissões de cada um, separadas")
    void doisPerfis() {
        var pessoa = login(PerfilNome.PROFESSOR, PerfilNome.RESPONSAVEL);
        grupoPadraoService.vincular(pessoa.getDadosPessoais(), PerfilNome.PROFESSOR);
        grupoPadraoService.vincular(pessoa.getDadosPessoais(), PerfilNome.RESPONSAVEL);

        var perfis = service.doUsuario(pessoa).perfis();

        assertThat(perfis.get(PerfilNome.PROFESSOR).telas()).hasSize(14).contains("DIARIO");
        assertThat(perfis.get(PerfilNome.RESPONSAVEL).telas()).hasSize(9).contains("FINANCEIRO");
        assertThat(perfis.get(PerfilNome.RESPONSAVEL).controles()).containsExactly("FICHA_MEDICA.INCLUIR");
    }

    @Test
    @DisplayName("tela fora do teto do perfil é ignorada mesmo se estiver no grupo")
    void foraDoTeto() {
        var professor = login(PerfilNome.PROFESSOR);
        grupoPadraoService.vincular(professor.getDadosPessoais(), PerfilNome.PROFESSOR);
        // Burla a validação do serviço, como um ajuste manual no banco faria.
        jdbc.update("""
                insert into grupos_usuarios_telas (grupo_usuario_id, tela_id, criado_em, atualizado_em)
                select g.id, t.id, now(), now() from grupos_usuarios g, telas t, perfis p
                where p.id = g.perfil_id and p.nome = 'PROFESSOR' and g.padrao = true
                  and t.codigo = 'SECRETARIA_CRM'
                """);

        assertThat(service.doUsuario(professor).perfis().get(PerfilNome.PROFESSOR).telas())
                .doesNotContain("SECRETARIA_CRM");
    }

    @Test
    @DisplayName("ADMIN recebe o teto do perfil, sem grupo e sem os dados da orientação")
    void admin() {
        var permissoes = service.doUsuario(login(PerfilNome.ADMIN));

        assertThat(permissoes.gerenciaPermissoes()).isTrue();
        assertThat(permissoes.perfis().get(PerfilNome.ADMIN).telas()).hasSize(41);
        assertThat(permissoes.perfis().get(PerfilNome.ADMIN).controles()).hasSize(9)
                .noneMatch(codigo -> codigo.startsWith("SITUACAO_FAMILIAR.")
                        || codigo.startsWith("ATENDIMENTO_PSICOLOGICO."));
    }

    @Test
    @DisplayName("DIRETOR passa pelo grupo e também gerencia permissões")
    void diretor() {
        var diretor = login(PerfilNome.DIRETOR);
        grupoPadraoService.vincular(diretor.getDadosPessoais(), PerfilNome.DIRETOR);

        var permissoes = service.doUsuario(diretor);

        assertThat(permissoes.gerenciaPermissoes()).isTrue();
        assertThat(permissoes.perfis().get(PerfilNome.DIRETOR).telas()).hasSize(41);
    }

    @Test
    @DisplayName("o cadastro de usuário coloca a pessoa no grupo padrão do perfil (D2)")
    void cadastroVinculaAoPadrao() {
        var pessoa = new DadosPessoais();
        pessoa.setNome("Nova Secretária");
        var sufixo = UUID.randomUUID().toString().substring(0, 8);
        pessoa.setEmail("nova-" + sufixo + "@pessoal.test");
        // O cadastro usa o e-mail profissional como login.
        pessoa.setEmailProfissional("nova-" + sufixo + "@escola.test");

        usuarioService.cadastrarUsuario(pessoa, PerfilNome.SECRETARIO, "senha-inicial");

        var padrao = grupoRepository.findPadraoDoPerfil(PerfilNome.SECRETARIO).orElseThrow();
        assertThat(membroRepository.findByGrupoUsuarioIdAndDadosPessoaisId(padrao.getId(), pessoa.getId())).isPresent();
    }

    @Test
    @DisplayName("vincular de novo não duplica, e ADMIN não entra em grupo")
    void vincularIdempotente() {
        var pessoa = login(PerfilNome.SECRETARIO, PerfilNome.ADMIN);
        grupoPadraoService.vincular(pessoa.getDadosPessoais(), PerfilNome.SECRETARIO);
        grupoPadraoService.vincular(pessoa.getDadosPessoais(), PerfilNome.SECRETARIO);
        grupoPadraoService.vincular(pessoa.getDadosPessoais(), PerfilNome.ADMIN);

        var grupos = jdbc.queryForObject(
                "select count(*) from dados_pessoais_grupos_usuarios where dados_pessoais_id = ?",
                Long.class, pessoa.getDadosPessoais().getId());
        assertThat(grupos).isEqualTo(1L);
    }

    // ------------------------------------------------------------ apoio

    private DadosAutenticacao login(PerfilNome... perfis) {
        var sufixo = UUID.randomUUID().toString().substring(0, 8);
        var dados = new DadosPessoais();
        dados.setNome("Pessoa " + sufixo);
        dados.setEmail("pessoa-" + sufixo + "@pessoal.test");
        for (var perfil : perfis) {
            dados.getPerfis().add(perfilRepository.findByNome(perfil));
        }
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
