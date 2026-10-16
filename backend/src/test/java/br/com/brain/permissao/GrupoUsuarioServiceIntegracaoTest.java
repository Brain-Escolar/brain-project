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
import br.com.brain.permissao.dto.CadastroGrupoUsuarioDto;
import br.com.brain.permissao.dto.ControleCatalogoDto;
import br.com.brain.permissao.dto.DuplicacaoGrupoUsuarioDto;
import br.com.brain.permissao.dto.ListagemGrupoUsuarioDto;
import br.com.brain.permissao.dto.MembroGrupoDto;
import br.com.brain.permissao.dto.PessoaGrupoDto;
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

/**
 * O que depende de SQL de verdade: o seed da V111, as consultas de membros e
 * candidatos (join com o login, nome social) e a exclusão com vínculos.
 * Cada teste roda numa transação desfeita no fim.
 */
@SpringBootTest
@Transactional
@DisplayName("GrupoUsuarioService (com banco)")
class GrupoUsuarioServiceIntegracaoTest {

    private static final PageRequest PRIMEIRA_PAGINA = PageRequest.of(0, 50);

    @Autowired
    private GrupoUsuarioService service;
    @Autowired
    private CatalogoPermissaoService catalogoService;
    @Autowired
    private DadosPessoaisRepository dadosPessoaisRepository;
    @Autowired
    private DadosAutenticacaoRepository dadosAutenticacaoRepository;
    @Autowired
    private PerfilRepository perfilRepository;
    @Autowired
    private GrupoUsuarioRepository grupoRepository;

    @Test
    @DisplayName("o seed cria um grupo padrão por perfil, menos ADMIN, com o que o perfil acessa hoje")
    void seedDosGruposPadrao() {
        var padroes = service.listar(null).stream().filter(ListagemGrupoUsuarioDto::padrao).toList();

        assertThat(padroes).hasSize(8);
        assertThat(padroes).extracting(ListagemGrupoUsuarioDto::perfil).doesNotContain(PerfilNome.ADMIN);
        var secretaria = padroes.stream().filter(g -> g.perfil() == PerfilNome.SECRETARIO).findFirst().orElseThrow();
        assertThat(secretaria.quantidadeTelas()).isEqualTo(11);
        assertThat(secretaria.quantidadeControles()).isEqualTo(5);
    }

    @Test
    @DisplayName("o catálogo da secretaria agrupa controles por tela e não traz os da orientação")
    void catalogoDaSecretaria() {
        var catalogo = catalogoService.catalogo(PerfilNome.SECRETARIO);

        assertThat(catalogo.telas()).hasSize(11);
        var detalhe = catalogo.telas().stream().filter(t -> t.codigo().equals("ALUNO_DETALHE")).findFirst()
                .orElseThrow();
        assertThat(detalhe.controles()).extracting(ControleCatalogoDto::codigo)
                .contains("FICHA_MEDICA.VER", "ALUNO.PRODUTOS.VER")
                .doesNotContain("SITUACAO_FAMILIAR.VER", "ATENDIMENTO_PSICOLOGICO.VER");
        assertThat(catalogo.controlesGerais()).extracting(ControleCatalogoDto::codigo)
                .containsExactly("ALUNO.DADOS_PESSOAIS.VER");
        assertThat(catalogo.dependencias()).containsEntry("ALUNO_CADASTRO", List.of("ALUNO.DADOS_PESSOAIS.VER"));
        // Uma lista só, por nome: sem separar telas de menu das internas.
        assertThat(catalogo.telas()).extracting(TelaCatalogoDto::nome).isSorted();
    }

    @Test
    @DisplayName("fluxo completo: criar, dar acessos, adicionar e remover pessoas, duplicar e excluir")
    void fluxoCompleto() {
        var ana = pessoa("Ana Souza", null, PerfilNome.SECRETARIO, true);
        var semLogin = pessoa("Bruno Lima", null, PerfilNome.SECRETARIO, false);
        var professora = pessoa("Carla Dias", null, PerfilNome.PROFESSOR, true);

        var grupo = service.cadastrar(new CadastroGrupoUsuarioDto(PerfilNome.SECRETARIO, "Só documentos", null));
        var comAcessos = service.salvarAcessos(grupo.id(),
                new AcessosGrupoUsuarioDto(Set.of("SECRETARIA_DOCUMENTOS", "CALENDARIO"), Set.of()));
        assertThat(comAcessos.telas()).containsExactly("CALENDARIO", "SECRETARIA_DOCUMENTOS");

        // Candidato: tem login e o perfil do grupo. Sem login ou de outro perfil, não.
        assertThat(idsDe(service.buscarCandidatos(grupo.id(), "", PRIMEIRA_PAGINA).getContent()))
                .contains(ana.getId())
                .doesNotContain(semLogin.getId(), professora.getId());

        service.adicionarMembros(grupo.id(), new AdicaoMembrosDto(Set.of(ana.getId())));
        var membros = service.buscarMembros(grupo.id(), "", PRIMEIRA_PAGINA).getContent();
        assertThat(membros).extracting(MembroGrupoDto::nome).containsExactly("Ana Souza");
        assertThat(membros.get(0).email()).endsWith("@escola.test");
        assertThat(service.buscarMembros(grupo.id(), "SOUZA", PRIMEIRA_PAGINA).getContent()).hasSize(1);
        assertThat(service.buscarMembros(grupo.id(), "outra pessoa", PRIMEIRA_PAGINA).getContent()).isEmpty();
        assertThat(idsDe(service.buscarCandidatos(grupo.id(), "", PRIMEIRA_PAGINA).getContent()))
                .doesNotContain(ana.getId());

        assertThatThrownBy(() -> service.adicionarMembros(grupo.id(), new AdicaoMembrosDto(Set.of(professora.getId()))))
                .isInstanceOf(ErrosSistema.OperacaoInvalidaException.class);

        var copia = service.duplicar(grupo.id(), new DuplicacaoGrupoUsuarioDto("Só documentos (cópia)"));
        assertThat(copia.telas()).containsExactly("CALENDARIO", "SECRETARIA_DOCUMENTOS");
        assertThat(copia.quantidadeMembros()).isZero();

        service.removerMembro(grupo.id(), ana.getId());
        assertThat(service.buscarMembros(grupo.id(), "", PRIMEIRA_PAGINA).getContent()).isEmpty();

        service.adicionarMembros(grupo.id(), new AdicaoMembrosDto(Set.of(ana.getId())));
        service.excluir(grupo.id());
        assertThat(grupoRepository.findById(grupo.id())).isEmpty();
    }

    @Test
    @DisplayName("a lista de membros mostra o nome social quando ele existe")
    void nomeSocial() {
        var pessoa = pessoa("Eduardo Reis", "Duda", PerfilNome.SECRETARIO, true);
        var grupo = service.cadastrar(new CadastroGrupoUsuarioDto(PerfilNome.SECRETARIO, "Atendimento", null));

        service.adicionarMembros(grupo.id(), new AdicaoMembrosDto(Set.of(pessoa.getId())));

        assertThat(service.buscarMembros(grupo.id(), "duda", PRIMEIRA_PAGINA).getContent())
                .extracting(MembroGrupoDto::nome).containsExactly("Duda");
    }

    // ------------------------------------------------------------ apoio

    private DadosPessoais pessoa(String nome, String nomeSocial, PerfilNome perfil, boolean comLogin) {
        var sufixo = UUID.randomUUID().toString().substring(0, 8);
        var dados = new DadosPessoais();
        dados.setNome(nome);
        dados.setNomeSocial(nomeSocial);
        dados.setEmail("pessoa-" + sufixo + "@pessoal.test");
        dados.getPerfis().add(perfilRepository.findByNome(perfil));
        dados = dadosPessoaisRepository.save(dados);

        if (comLogin) {
            var login = new DadosAutenticacao();
            login.setEmail(nome.toLowerCase().replace(' ', '.') + "-" + sufixo + "@escola.test");
            login.setSenha("nao-usada");
            login.setVerificado(true);
            login.setAtivo(true);
            login.setDadosPessoais(dados);
            dadosAutenticacaoRepository.save(login);
        }
        return dados;
    }

    private static List<Long> idsDe(List<PessoaGrupoDto> pessoas) {
        return pessoas.stream().map(PessoaGrupoDto::dadosPessoaisId).toList();
    }
}
