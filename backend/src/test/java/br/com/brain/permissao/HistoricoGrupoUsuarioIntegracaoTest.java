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
import br.com.brain.permissao.dto.RevisaoGrupoUsuarioDto;
import br.com.brain.permissao.dto.RevisaoGrupoUsuarioDto.CampoAlteradoDto;
import br.com.brain.permissao.dto.RevisaoGrupoUsuarioDto.ItemDto;
import br.com.brain.permissao.dto.RevisaoGrupoUsuarioDto.PessoaDto;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.function.Supplier;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.support.TransactionTemplate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * O histórico lê o que o Envers grava no commit, então aqui cada passo roda e
 * confirma a própria transação (sem @Transactional na classe). O que o teste
 * cria é apagado no fim, junto com as linhas _AUD.
 */
@SpringBootTest
@DisplayName("Histórico do grupo de usuários (com banco)")
class HistoricoGrupoUsuarioIntegracaoTest {

    private static final PageRequest PRIMEIRA_PAGINA = PageRequest.of(0, 20);

    @Autowired
    private HistoricoGrupoUsuarioService historicoService;
    @Autowired
    private GrupoUsuarioService grupoService;
    @Autowired
    private GrupoPadraoService grupoPadraoService;
    @Autowired
    private DadosPessoaisRepository dadosPessoaisRepository;
    @Autowired
    private DadosAutenticacaoRepository dadosAutenticacaoRepository;
    @Autowired
    private PerfilRepository perfilRepository;
    @Autowired
    private TransactionTemplate transacao;
    @Autowired
    private NamedParameterJdbcTemplate jdbc;

    private final List<Long> grupos = new ArrayList<>();
    private final List<Long> pessoas = new ArrayList<>();

    @Test
    @DisplayName("cada salvamento vira uma revisão, da mais recente para a mais antiga, com autor e o que mudou")
    void historicoCompleto() {
        var diretor = loginNoGrupoPadrao(PerfilNome.DIRETOR);
        var secretaria = loginNoGrupoPadrao(PerfilNome.SECRETARIO);
        logar(diretor);

        var id = emTransacao(() -> grupoService.cadastrar(
                new CadastroGrupoUsuarioDto(PerfilNome.SECRETARIO, "Histórico " + sufixo(), "Primeira versão"))).id();
        grupos.add(id);
        var nomeInicial = emTransacao(() -> grupoService.detalhar(id)).nome();
        emTransacao(() -> grupoService.salvarAcessos(id,
                new AcessosGrupoUsuarioDto(Set.of("CALENDARIO", "COMUNICACAO"), Set.of("EVENTO.GERENCIAR"))));
        emTransacao(() -> grupoService.salvarAcessos(id,
                new AcessosGrupoUsuarioDto(Set.of("CALENDARIO"), Set.of())));
        emTransacao(() -> grupoService.atualizar(id,
                new AtualizacaoGrupoUsuarioDto("Renomeado " + sufixo(), "Primeira versão", false)));
        var pessoaId = secretaria.getDadosPessoais().getId();
        emTransacao(() -> {
            grupoService.adicionarMembros(id, new AdicaoMembrosDto(Set.of(pessoaId)));
            return null;
        });
        emTransacao(() -> {
            grupoService.removerMembro(id, pessoaId);
            return null;
        });

        var pagina = historicoService.historico(id, diretor, PRIMEIRA_PAGINA);

        assertThat(pagina.getTotalElements()).isEqualTo(6);
        var revisoes = pagina.getContent();
        var autor = new PessoaDto(diretor.getDadosPessoais().getId(), diretor.getDadosPessoais().getNome());
        assertThat(revisoes).extracting(RevisaoGrupoUsuarioDto::autor).containsOnly(autor);

        var nomeSecretaria = secretaria.getDadosPessoais().getNome();
        assertThat(revisoes.get(0).pessoasRemovidas()).containsExactly(new PessoaDto(pessoaId, nomeSecretaria));
        assertThat(revisoes.get(1).pessoasAdicionadas()).containsExactly(new PessoaDto(pessoaId, nomeSecretaria));

        var edicao = revisoes.get(2);
        assertThat(edicao.criacao()).isFalse();
        assertThat(edicao.campos()).extracting(CampoAlteradoDto::campo).containsExactly("nome", "ativo");
        assertThat(edicao.campos().get(0).antes()).isEqualTo(nomeInicial);
        assertThat(edicao.campos().get(1)).isEqualTo(new CampoAlteradoDto("ativo", "true", "false"));

        var retirada = revisoes.get(3);
        assertThat(retirada.telasRetiradas()).extracting(ItemDto::codigo).containsExactly("COMUNICACAO");
        assertThat(retirada.controlesRetirados()).extracting(ItemDto::codigo).containsExactly("EVENTO.GERENCIAR");
        assertThat(retirada.telasConcedidas()).isEmpty();

        var concessao = revisoes.get(4);
        assertThat(concessao.telasConcedidas()).extracting(ItemDto::codigo)
                .containsExactlyInAnyOrder("CALENDARIO", "COMUNICACAO");
        assertThat(concessao.controlesConcedidos()).extracting(ItemDto::codigo).containsExactly("EVENTO.GERENCIAR");
        assertThat(concessao.telasConcedidas()).allSatisfy(item -> assertThat(item.nome()).isNotBlank());

        var criacao = revisoes.get(5);
        assertThat(criacao.criacao()).isTrue();
        assertThat(criacao.campos()).containsExactly(
                new CampoAlteradoDto("nome", null, nomeInicial),
                new CampoAlteradoDto("descricao", null, "Primeira versão"));
    }

    @Test
    @DisplayName("pagina pelas revisões, não pelas linhas")
    void paginacao() {
        var diretor = loginNoGrupoPadrao(PerfilNome.DIRETOR);
        logar(diretor);
        var id = emTransacao(() -> grupoService.cadastrar(
                new CadastroGrupoUsuarioDto(PerfilNome.SECRETARIO, "Paginado " + sufixo(), null))).id();
        grupos.add(id);
        emTransacao(() -> grupoService.salvarAcessos(id,
                new AcessosGrupoUsuarioDto(Set.of("CALENDARIO", "COMUNICACAO"), Set.of("EVENTO.GERENCIAR"))));
        emTransacao(() -> grupoService.salvarAcessos(id, new AcessosGrupoUsuarioDto(Set.of(), Set.of())));

        var segunda = historicoService.historico(id, diretor, PageRequest.of(1, 2));

        assertThat(segunda.getTotalElements()).isEqualTo(3);
        assertThat(segunda.getContent()).singleElement().satisfies(revisao -> assertThat(revisao.criacao()).isTrue());
    }

    @Test
    @DisplayName("sem o controle de histórico, recusa; grupo inexistente responde 404")
    void permissaoEGrupoInexistente() {
        var secretaria = loginNoGrupoPadrao(PerfilNome.SECRETARIO);
        var diretor = loginNoGrupoPadrao(PerfilNome.DIRETOR);
        var padraoDaSecretaria = emTransacao(() -> grupoService.listar(PerfilNome.SECRETARIO)).stream()
                .filter(g -> g.padrao()).findFirst().orElseThrow().id();

        assertThatThrownBy(() -> historicoService.historico(padraoDaSecretaria, secretaria, PRIMEIRA_PAGINA))
                .isInstanceOf(ErrosSistema.AcessoNegadoException.class);
        assertThatThrownBy(() -> historicoService.historico(-1L, diretor, PRIMEIRA_PAGINA))
                .isInstanceOf(ErrosSistema.RecursoNaoEncontradoException.class);
    }

    @AfterEach
    void limpar() {
        SecurityContextHolder.clearContext();
        var params = new java.util.HashMap<String, Object>();
        params.put("grupos", grupos.isEmpty() ? List.of(-1L) : grupos);
        params.put("pessoas", pessoas.isEmpty() ? List.of(-1L) : pessoas);
        transacao.executeWithoutResult(status -> {
            for (var tabela : List.of("dados_pessoais_grupos_usuarios", "dados_pessoais_grupos_usuarios_AUD")) {
                jdbc.update("delete from " + tabela
                        + " where grupo_usuario_id in (:grupos) or dados_pessoais_id in (:pessoas)", params);
            }
            for (var tabela : List.of("grupos_usuarios_telas", "grupos_usuarios_controles",
                    "grupos_usuarios_telas_AUD", "grupos_usuarios_controles_AUD")) {
                jdbc.update("delete from " + tabela + " where grupo_usuario_id in (:grupos)", params);
            }
            jdbc.update("delete from grupos_usuarios where id in (:grupos)", params);
            jdbc.update("delete from grupos_usuarios_AUD where id in (:grupos)", params);
            for (var tabela : List.of("dados_autenticacao", "dados_autenticacao_AUD", "dados_pessoais_perfis")) {
                jdbc.update("delete from " + tabela + " where dados_pessoais_id in (:pessoas)", params);
            }
            jdbc.update("delete from dados_pessoais where id in (:pessoas)", params);
            jdbc.update("delete from dados_pessoais_AUD where id in (:pessoas)", params);
        });
        grupos.clear();
        pessoas.clear();
    }

    // ------------------------------------------------------------ apoio

    private <T> T emTransacao(Supplier<T> passo) {
        return transacao.execute(status -> passo.get());
    }

    private void logar(DadosAutenticacao usuario) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(usuario, null, usuario.getAuthorities()));
    }

    private DadosAutenticacao loginNoGrupoPadrao(PerfilNome perfil) {
        return emTransacao(() -> {
            var sufixo = sufixo();
            var dados = new DadosPessoais();
            dados.setNome("Pessoa " + sufixo);
            dados.setEmail("pessoa-" + sufixo + "@pessoal.test");
            dados.getPerfis().add(perfilRepository.findByNome(perfil));
            dados = dadosPessoaisRepository.save(dados);
            pessoas.add(dados.getId());
            grupoPadraoService.vincular(dados, perfil);

            var login = new DadosAutenticacao();
            login.setEmail("login-" + sufixo + "@escola.test");
            login.setSenha("nao-usada");
            login.setVerificado(true);
            login.setAtivo(true);
            login.setDadosPessoais(dados);
            return dadosAutenticacaoRepository.save(login);
        });
    }

    private static String sufixo() {
        return UUID.randomUUID().toString().substring(0, 8);
    }
}
