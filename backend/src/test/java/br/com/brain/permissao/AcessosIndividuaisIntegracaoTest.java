package br.com.brain.permissao;

import br.com.brain.autenticacao.DadosAutenticacao;
import br.com.brain.autenticacao.DadosAutenticacaoRepository;
import br.com.brain.dadosPessoais.DadosPessoais;
import br.com.brain.dadosPessoais.DadosPessoaisRepository;
import br.com.brain.enums.PerfilNome;
import br.com.brain.exception.ErrosSistema;
import br.com.brain.perfil.PerfilRepository;
import br.com.brain.permissao.dto.AcessosGrupoUsuarioDto;
import br.com.brain.permissao.dto.AdicaoMembrosDto;
import br.com.brain.permissao.dto.AtualizacaoGrupoUsuarioDto;
import br.com.brain.permissao.dto.CadastroGrupoUsuarioDto;
import br.com.brain.permissao.dto.ControleCatalogoDto;
import br.com.brain.permissao.dto.GrupoDaPessoaDto;
import br.com.brain.permissao.dto.ListagemGrupoUsuarioDto;
import br.com.brain.permissao.dto.MembroGrupoDto;
import br.com.brain.permissao.dto.TelaCatalogoDto;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.tuple;

/**
 * Acessos individuais (docs/permissoes.md, D18–D21): um grupo de uma pessoa
 * só, somado aos grupos dela. Cada teste roda numa transação desfeita no fim.
 */
@SpringBootTest
@Transactional
@DisplayName("Acessos individuais (com banco)")
class AcessosIndividuaisIntegracaoTest {

    private static final PerfilNome SECRETARIO = PerfilNome.SECRETARIO;

    @Autowired
    private GrupoUsuarioService service;
    @Autowired
    private PermissoesUsuarioService permissoesService;
    @Autowired
    private CatalogoPermissaoService catalogoService;
    @Autowired
    private GrupoPadraoService grupoPadraoService;
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

    @Test
    @DisplayName("os acessos individuais somam aos do grupo, e a tela mostra de onde vem cada um")
    void somaAoGrupo() {
        var ana = login("Ana Souza", SECRETARIO);
        var restrito = grupoComTelas("Só matrículas", Set.of("SECRETARIA_MATRICULAS"));
        service.adicionarMembros(restrito, new AdicaoMembrosDto(Set.of(idDe(ana))));

        var salvo = service.salvarAcessosIndividuais(idDe(ana), SECRETARIO,
                acessos(Set.of("SECRETARIA_CRM"), Set.of()));

        assertThat(salvo.telas()).containsExactly("SECRETARIA_CRM");
        assertThat(salvo.herdados()).containsEntry("SECRETARIA_MATRICULAS", List.of("Só matrículas"));
        assertThat(salvo.grupos()).extracting(GrupoDaPessoaDto::nome).containsExactly("Só matrículas");
        assertThat(telasEfetivas(ana)).containsExactlyInAnyOrder("SECRETARIA_MATRICULAS", "SECRETARIA_CRM");
    }

    @Test
    @DisplayName("sem nenhum grupo no perfil, os acessos individuais valem sozinhos")
    void valemSemGrupo() {
        var bruno = login("Bruno Lima", SECRETARIO);

        service.salvarAcessosIndividuais(idDe(bruno), SECRETARIO, acessos(Set.of("CALENDARIO"), Set.of()));

        assertThat(telasEfetivas(bruno)).containsExactly("CALENDARIO");
        assertThat(service.acessosIndividuais(idDe(bruno), SECRETARIO).grupos()).isEmpty();
    }

    @Test
    @DisplayName("grupo inativo não aparece entre os herdados, mas aparece entre os grupos da pessoa")
    void grupoInativo() {
        var carla = login("Carla Dias", SECRETARIO);
        var grupo = grupoComTelas("Temporário", Set.of("SECRETARIA_DOCUMENTOS"));
        service.adicionarMembros(grupo, new AdicaoMembrosDto(Set.of(idDe(carla))));
        service.atualizar(grupo, new AtualizacaoGrupoUsuarioDto("Temporário", null, false));

        var acessos = service.acessosIndividuais(idDe(carla), SECRETARIO);

        assertThat(acessos.herdados()).isEmpty();
        assertThat(acessos.grupos()).extracting(GrupoDaPessoaDto::ativo).containsExactly(false);
    }

    @Test
    @DisplayName("passa do teto do perfil, inclusive com dado sensível, e vale no /permissoes/me")
    void foraDoTeto() {
        var dani = login("Daniela Reis", SECRETARIO);

        // Lista de alunos é do ADMIN; situação familiar, só da orientação.
        service.salvarAcessosIndividuais(idDe(dani), SECRETARIO,
                acessos(Set.of("ALUNO_LISTA", "ALUNO_DETALHE"), Set.of("SITUACAO_FAMILIAR.VER")));

        var permissoes = permissoesService.doUsuario(dani).perfis().get(SECRETARIO);
        assertThat(permissoes.telas()).containsExactlyInAnyOrder("ALUNO_LISTA", "ALUNO_DETALHE");
        assertThat(permissoes.controles()).containsExactly("SITUACAO_FAMILIAR.VER");
        assertThat(permissoesService.temAlgumaTela(dani, Set.of("ALUNO_LISTA", "SECRETARIA_CRM"))).isTrue();
        assertThat(permissoesService.temAlgumaTela(dani, Set.of("SECRETARIA_CRM"))).isFalse();
    }

    @Test
    @DisplayName("tela do controle e dependências valem no próprio conjunto; código inexistente é recusado")
    void mesmasRegras() {
        var dani = login("Daniela Reis", SECRETARIO);
        grupoPadraoService.vincular(dani.getDadosPessoais(), SECRETARIO);

        // O grupo padrão já dá a tela, mas o conjunto individual precisa funcionar sozinho.
        assertThatThrownBy(() -> service.salvarAcessosIndividuais(idDe(dani), SECRETARIO,
                acessos(Set.of(), Set.of("ALUNO.EDITAR"))))
                .isInstanceOf(ErrosSistema.OperacaoInvalidaException.class);
        assertThatThrownBy(() -> service.salvarAcessosIndividuais(idDe(dani), SECRETARIO,
                acessos(Set.of("TELA_QUE_NAO_EXISTE"), Set.of())))
                .isInstanceOf(ErrosSistema.OperacaoInvalidaException.class)
                .hasMessageContaining("não existem no catálogo");
    }

    @Test
    @DisplayName("um grupo normal continua preso ao teto do perfil")
    void grupoNormalNoTeto() {
        var grupo = service.cadastrar(new CadastroGrupoUsuarioDto(SECRETARIO, "Tenta passar do teto", null));

        assertThatThrownBy(() -> service.salvarAcessos(grupo.id(), acessos(Set.of("ALUNO_LISTA"), Set.of())))
                .isInstanceOf(ErrosSistema.OperacaoInvalidaException.class)
                .hasMessageContaining("fora do que o perfil SECRETARIO pode receber");
    }

    @Test
    @DisplayName("o catálogo individual traz o sistema inteiro, com o que é de fora do perfil e o sensível marcados")
    void catalogoIndividual() {
        var catalogo = catalogoService.catalogoIndividual(SECRETARIO);
        var doPerfil = catalogoService.catalogo(SECRETARIO);

        assertThat(catalogo.telas()).hasSize(57).extracting(TelaCatalogoDto::nome).isSorted();
        assertThat(catalogo.telas().stream().filter(TelaCatalogoDto::doPerfil).map(TelaCatalogoDto::codigo))
                .containsExactlyInAnyOrderElementsOf(doPerfil.telas().stream().map(TelaCatalogoDto::codigo).toList());
        var controlesDoDetalhe = catalogo.telas().stream().filter(t -> t.codigo().equals("ALUNO_DETALHE"))
                .findFirst().orElseThrow().controles();
        var situacao = controlesDoDetalhe.stream().filter(c -> c.codigo().equals("SITUACAO_FAMILIAR.VER"))
                .findFirst().orElseThrow();
        assertThat(situacao.doPerfil()).isFalse();
        assertThat(situacao.sensivel()).isTrue();
        assertThat(controlesDoDetalhe.stream().filter(c -> c.codigo().equals("FICHA_MEDICA.VER")).findFirst()
                .orElseThrow()).extracting(ControleCatalogoDto::doPerfil, ControleCatalogoDto::sensivel)
                .containsExactly(true, false);
    }

    @Test
    @DisplayName("ADMIN não recebe acesso individual, e quem não tem o perfil também não")
    void recusas() {
        var professora = login("Elisa Prado", PerfilNome.PROFESSOR);
        var admin = login("Fábio Nunes", PerfilNome.ADMIN);

        assertThatThrownBy(() -> service.salvarAcessosIndividuais(idDe(admin), PerfilNome.ADMIN,
                acessos(Set.of("CALENDARIO"), Set.of())))
                .isInstanceOf(ErrosSistema.OperacaoInvalidaException.class);
        assertThatThrownBy(() -> service.salvarAcessosIndividuais(idDe(professora), SECRETARIO,
                acessos(Set.of("CALENDARIO"), Set.of())))
                .isInstanceOf(ErrosSistema.OperacaoInvalidaException.class)
                .hasMessageContaining("não tem o perfil");
    }

    @Test
    @DisplayName("tirar todos os acessos individuais apaga o grupo individual e o vínculo")
    void vazioApaga() {
        var gabi = login("Gabriela Melo", SECRETARIO);
        service.salvarAcessosIndividuais(idDe(gabi), SECRETARIO, acessos(Set.of("CALENDARIO"), Set.of()));
        var individual = grupoRepository.findIndividual(SECRETARIO, idDe(gabi)).orElseThrow();

        var vazio = service.salvarAcessosIndividuais(idDe(gabi), SECRETARIO, acessos(Set.of(), Set.of()));

        assertThat(vazio.telas()).isEmpty();
        assertThat(grupoRepository.findIndividual(SECRETARIO, idDe(gabi))).isEmpty();
        assertThat(membroRepository.findByGrupoUsuarioId(individual.getId())).isEmpty();
        assertThat(telasEfetivas(gabi)).isEmpty();
    }

    @Test
    @DisplayName("o grupo individual não aparece na lista e não abre pelos endpoints de grupo")
    void escondidoDosGrupos() {
        var hugo = login("Hugo Alves", SECRETARIO);
        service.salvarAcessosIndividuais(idDe(hugo), SECRETARIO, acessos(Set.of("CALENDARIO"), Set.of()));
        var individual = grupoRepository.findIndividual(SECRETARIO, idDe(hugo)).orElseThrow();

        assertThat(service.listar(null)).extracting(ListagemGrupoUsuarioDto::id).doesNotContain(individual.getId());
        assertThatThrownBy(() -> service.detalhar(individual.getId()))
                .isInstanceOf(ErrosSistema.RecursoNaoEncontradoException.class);
        assertThatThrownBy(() -> service.excluir(individual.getId()))
                .isInstanceOf(ErrosSistema.RecursoNaoEncontradoException.class);
    }

    @Test
    @DisplayName("a aba Pessoas conta só o que cada membro tem além dos grupos ativos dele")
    void contadorNaAbaPessoas() {
        var iara = login("Iara Costa", SECRETARIO);
        var joao = login("João Pires", SECRETARIO);
        var grupo = grupoComTelas("Recepção", Set.of("CALENDARIO"));
        service.adicionarMembros(grupo, new AdicaoMembrosDto(Set.of(idDe(iara), idDe(joao))));
        // CALENDARIO já vem do grupo: está no conjunto individual, mas não é acesso a mais.
        service.salvarAcessosIndividuais(idDe(iara), SECRETARIO,
                acessos(Set.of("SECRETARIA_CRM", "COMUNICADOS", "CALENDARIO"), Set.of()));

        var membros = service.buscarMembros(grupo, "", PageRequest.of(0, 10)).getContent();

        assertThat(membros).extracting(MembroGrupoDto::nome, MembroGrupoDto::acessosIndividuais)
                .containsExactly(
                        tuple("Iara Costa", 2L),
                        tuple("João Pires", 0L));
    }

    @Test
    @DisplayName("duas pessoas com o mesmo nome têm cada uma o seu grupo individual")
    void mesmoNome() {
        var uma = login("Maria Silva", SECRETARIO);
        var outra = login("Maria Silva", SECRETARIO);

        service.salvarAcessosIndividuais(idDe(uma), SECRETARIO, acessos(Set.of("CALENDARIO"), Set.of()));
        service.salvarAcessosIndividuais(idDe(outra), SECRETARIO, acessos(Set.of("COMUNICADOS"), Set.of()));

        assertThat(telasEfetivas(uma)).containsExactly("CALENDARIO");
        assertThat(telasEfetivas(outra)).containsExactly("COMUNICADOS");
    }

    // ------------------------------------------------------------ apoio

    private Long grupoComTelas(String nome, Set<String> telas) {
        var grupo = service.cadastrar(new CadastroGrupoUsuarioDto(SECRETARIO, nome, null));
        service.salvarAcessos(grupo.id(), acessos(telas, Set.of()));
        return grupo.id();
    }

    private List<String> telasEfetivas(DadosAutenticacao login) {
        return permissoesService.doUsuario(login).perfis().get(SECRETARIO).telas();
    }

    private static AcessosGrupoUsuarioDto acessos(Set<String> telas, Set<String> controles) {
        return new AcessosGrupoUsuarioDto(telas, controles);
    }

    private static Long idDe(DadosAutenticacao login) {
        return login.getDadosPessoais().getId();
    }

    private DadosAutenticacao login(String nome, PerfilNome perfil) {
        var sufixo = UUID.randomUUID().toString().substring(0, 8);
        var dados = new DadosPessoais();
        dados.setNome(nome);
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
