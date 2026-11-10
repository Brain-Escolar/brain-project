package br.com.brain.permissao;

import br.com.brain.dadosPessoais.DadosPessoaisRepository;
import br.com.brain.enums.PerfilNome;
import br.com.brain.exception.ErrosSistema;
import br.com.brain.perfil.Perfil;
import br.com.brain.perfil.PerfilRepository;
import br.com.brain.permissao.dto.AcessosGrupoUsuarioDto;
import br.com.brain.permissao.dto.AdicaoMembrosDto;
import br.com.brain.permissao.dto.AtualizacaoGrupoUsuarioDto;
import br.com.brain.permissao.dto.CadastroGrupoUsuarioDto;
import br.com.brain.permissao.dto.DuplicacaoGrupoUsuarioDto;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyIterable;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * As regras da tela de grupos que o banco não expressa (RV1–RV8 da spec).
 *
 * Mock em tudo: as regras são de domínio. As consultas reais (membros,
 * candidatos, catálogo) ficam no GrupoUsuarioServiceIntegracaoTest.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("GrupoUsuarioService")
class GrupoUsuarioServiceTest {

    private static final Long GRUPO = 10L;
    private static final Long PERFIL_SECRETARIO = 3L;

    @Mock
    private GrupoUsuarioRepository grupoRepository;
    @Mock
    private GrupoUsuarioTelaRepository grupoTelaRepository;
    @Mock
    private GrupoUsuarioControleRepository grupoControleRepository;
    @Mock
    private GrupoUsuarioMembroRepository membroRepository;
    @Mock
    private PerfilRepository perfilRepository;
    @Mock
    private DadosPessoaisRepository dadosPessoaisRepository;
    @Mock
    private CatalogoPermissaoService catalogoService;

    @InjectMocks
    private GrupoUsuarioService service;

    // ------------------------------------------------------------ cadastro

    @Nested
    @DisplayName("cadastro e edição")
    class Cadastro {

        @Test
        @DisplayName("recusa grupo de ADMIN, que recebe o teto direto (RV2)")
        void recusaAdmin() {
            assertThatThrownBy(() -> service.cadastrar(new CadastroGrupoUsuarioDto(PerfilNome.ADMIN, "Admins", null)))
                    .isInstanceOf(ErrosSistema.OperacaoInvalidaException.class)
                    .hasMessageContaining("ADMIN");
            verify(grupoRepository, never()).save(any());
        }

        @Test
        @DisplayName("recusa nome que já existe no perfil, ignorando maiúsculas (RV1)")
        void recusaNomeRepetido() {
            when(perfilRepository.findByNome(PerfilNome.SECRETARIO)).thenReturn(secretario());
            when(grupoRepository.existsByPerfilIdAndNomeIgnoreCase(PERFIL_SECRETARIO, "Documentos")).thenReturn(true);

            assertThatThrownBy(() -> service.cadastrar(
                    new CadastroGrupoUsuarioDto(PerfilNome.SECRETARIO, "  Documentos ", null)))
                    .isInstanceOf(ErrosSistema.RecursoJaExisteException.class);
            verify(grupoRepository, never()).save(any());
        }

        @Test
        @DisplayName("cria grupo comum, ativo, sem acessos e com o nome limpo")
        void criaGrupoComum() {
            when(perfilRepository.findByNome(PerfilNome.SECRETARIO)).thenReturn(secretario());
            when(grupoRepository.save(any())).thenAnswer(inv -> {
                GrupoUsuario salvo = inv.getArgument(0);
                salvo.setId(GRUPO);
                return salvo;
            });

            var criado = service.cadastrar(new CadastroGrupoUsuarioDto(PerfilNome.SECRETARIO, " Documentos ", "  "));

            assertThat(criado.nome()).isEqualTo("Documentos");
            assertThat(criado.descricao()).isNull();
            assertThat(criado.padrao()).isFalse();
            assertThat(criado.ativo()).isTrue();
            assertThat(criado.telas()).isEmpty();
        }

        @Test
        @DisplayName("não desativa o grupo padrão (RV7)")
        void naoDesativaPadrao() {
            when(grupoRepository.findComPerfilById(GRUPO)).thenReturn(Optional.of(grupo(true)));

            assertThatThrownBy(() -> service.atualizar(GRUPO,
                    new AtualizacaoGrupoUsuarioDto("Secretaria (padrão)", null, false)))
                    .isInstanceOf(ErrosSistema.OperacaoInvalidaException.class)
                    .hasMessageContaining("padrão");
        }
    }

    // ------------------------------------------------------------ exclusão

    @Nested
    @DisplayName("exclusão")
    class Exclusao {

        @Test
        @DisplayName("não exclui o grupo padrão (RV7)")
        void naoExcluiPadrao() {
            when(grupoRepository.findComPerfilById(GRUPO)).thenReturn(Optional.of(grupo(true)));

            assertThatThrownBy(() -> service.excluir(GRUPO))
                    .isInstanceOf(ErrosSistema.OperacaoInvalidaException.class);
            verify(grupoRepository, never()).delete(any());
        }

        @Test
        @DisplayName("remove os vínculos pelo JPA antes do grupo, para o Envers registrar (RV8)")
        void removeVinculosAntes() {
            var grupo = grupo(false);
            when(grupoRepository.findComPerfilById(GRUPO)).thenReturn(Optional.of(grupo));

            service.excluir(GRUPO);

            InOrder ordem = inOrder(grupoTelaRepository, grupoControleRepository, membroRepository, grupoRepository);
            ordem.verify(grupoTelaRepository).deleteAll(anyIterable());
            ordem.verify(grupoControleRepository).deleteAll(anyIterable());
            ordem.verify(membroRepository).deleteAll(anyIterable());
            ordem.verify(grupoRepository).delete(grupo);
        }
    }

    // ------------------------------------------------------------ acessos

    @Nested
    @DisplayName("acessos")
    class Acessos {

        private final Tela detalhe = tela("ALUNO_DETALHE");
        private final Tela cadastro = tela("ALUNO_CADASTRO");
        private final Tela calendario = tela("CALENDARIO");
        private final Controle fichaVer = controle("FICHA_MEDICA.VER", detalhe);
        private final Controle dadosPessoais = controle("ALUNO.DADOS_PESSOAIS.VER", null);

        private void tetoDaSecretaria() {
            when(grupoRepository.findComPerfilById(GRUPO)).thenReturn(Optional.of(grupo(false)));
            when(catalogoService.teto(PerfilNome.SECRETARIO)).thenReturn(teto(
                    List.of(detalhe, cadastro, calendario), List.of(fichaVer, dadosPessoais)));
        }

        @Test
        @DisplayName("recusa item fora do teto do perfil (RV3)")
        void recusaForaDoTeto() {
            tetoDaSecretaria();

            assertThatThrownBy(() -> service.salvarAcessos(GRUPO,
                    new AcessosGrupoUsuarioDto(Set.of("CALENDARIO"), Set.of("SITUACAO_FAMILIAR.VER"))))
                    .isInstanceOf(ErrosSistema.OperacaoInvalidaException.class)
                    .hasMessageContaining("SITUACAO_FAMILIAR.VER");
            verify(grupoTelaRepository, never()).saveAll(anyIterable());
        }

        @Test
        @DisplayName("recusa controle sem a tela dele marcada (RV4)")
        void recusaControleSemTela() {
            tetoDaSecretaria();

            assertThatThrownBy(() -> service.salvarAcessos(GRUPO,
                    new AcessosGrupoUsuarioDto(Set.of("CALENDARIO"), Set.of("FICHA_MEDICA.VER"))))
                    .isInstanceOf(ErrosSistema.OperacaoInvalidaException.class)
                    .hasMessageContaining("FICHA_MEDICA.VER precisa da tela ALUNO_DETALHE");
        }

        @Test
        @DisplayName("recusa item sem a dependência declarada (RV5)")
        void recusaSemDependencia() {
            tetoDaSecretaria();

            assertThatThrownBy(() -> service.salvarAcessos(GRUPO,
                    new AcessosGrupoUsuarioDto(Set.of("ALUNO_CADASTRO"), Set.of())))
                    .isInstanceOf(ErrosSistema.OperacaoInvalidaException.class)
                    .hasMessageContaining("ALUNO_CADASTRO exige ALUNO.DADOS_PESSOAIS.VER");
        }

        @Test
        @DisplayName("grava só a diferença: remove o que saiu e cria o que entrou")
        @SuppressWarnings("unchecked")
        void gravaSoADiferenca() {
            tetoDaSecretaria();
            var grupo = grupo(false);
            var mantida = new GrupoUsuarioTela(grupo, detalhe);
            var removida = new GrupoUsuarioTela(grupo, calendario);
            when(grupoTelaRepository.findComTelaByGrupo(GRUPO)).thenReturn(List.of(mantida, removida));

            service.salvarAcessos(GRUPO, new AcessosGrupoUsuarioDto(
                    Set.of("ALUNO_DETALHE", "ALUNO_CADASTRO"), Set.of("ALUNO.DADOS_PESSOAIS.VER")));

            verify(grupoTelaRepository).deleteAll(List.of(removida));
            ArgumentCaptor<List<GrupoUsuarioTela>> novas = ArgumentCaptor.forClass(List.class);
            verify(grupoTelaRepository).saveAll(novas.capture());
            assertThat(novas.getValue()).extracting(gt -> gt.getTela().getCodigo()).containsExactly("ALUNO_CADASTRO");

            ArgumentCaptor<List<GrupoUsuarioControle>> controles = ArgumentCaptor.forClass(List.class);
            verify(grupoControleRepository).saveAll(controles.capture());
            assertThat(controles.getValue()).extracting(gc -> gc.getControle().getCodigo())
                    .containsExactly("ALUNO.DADOS_PESSOAIS.VER");
        }
    }

    // ------------------------------------------------------------ membros

    @Nested
    @DisplayName("membros")
    class Membros {

        @Test
        @DisplayName("recusa quem não tem o perfil do grupo (RV6)")
        void recusaSemPerfil() {
            when(grupoRepository.findComPerfilById(GRUPO)).thenReturn(Optional.of(grupo(false)));
            when(membroRepository.findComPerfilEntre(PERFIL_SECRETARIO, Set.of(1L, 2L))).thenReturn(Set.of(1L));

            assertThatThrownBy(() -> service.adicionarMembros(GRUPO, new AdicaoMembrosDto(Set.of(1L, 2L))))
                    .isInstanceOf(ErrosSistema.OperacaoInvalidaException.class)
                    .hasMessageContaining("SECRETARIO");
            verify(membroRepository, never()).saveAll(anyIterable());
        }

        @Test
        @DisplayName("ignora quem já está no grupo")
        @SuppressWarnings("unchecked")
        void ignoraQuemJaEstaNoGrupo() {
            when(grupoRepository.findComPerfilById(GRUPO)).thenReturn(Optional.of(grupo(false)));
            when(membroRepository.findComPerfilEntre(PERFIL_SECRETARIO, Set.of(1L, 2L))).thenReturn(Set.of(1L, 2L));
            when(membroRepository.findMembrosEntre(GRUPO, Set.of(1L, 2L))).thenReturn(Set.of(1L));

            service.adicionarMembros(GRUPO, new AdicaoMembrosDto(Set.of(1L, 2L)));

            ArgumentCaptor<List<GrupoUsuarioMembro>> novos = ArgumentCaptor.forClass(List.class);
            verify(membroRepository).saveAll(novos.capture());
            assertThat(novos.getValue()).hasSize(1);
            verify(dadosPessoaisRepository).getReferenceById(2L);
            verify(dadosPessoaisRepository, never()).getReferenceById(1L);
        }
    }

    // ------------------------------------------------------------ duplicação

    @Test
    @DisplayName("duplicar copia só os acessos que ainda estão no teto, sem os membros")
    @SuppressWarnings("unchecked")
    void duplicaSoOQueEstaNoTeto() {
        var origem = grupo(true);
        var calendario = tela("CALENDARIO");
        var foraDoTeto = tela("TELA_QUE_SAIU");
        when(grupoRepository.findComPerfilById(GRUPO)).thenReturn(Optional.of(origem));
        when(grupoRepository.save(any())).thenAnswer(inv -> {
            GrupoUsuario salvo = inv.getArgument(0);
            salvo.setId(GRUPO + 1);
            return salvo;
        });
        when(catalogoService.teto(PerfilNome.SECRETARIO)).thenReturn(teto(List.of(calendario), List.of()));
        when(grupoTelaRepository.findComTelaByGrupo(GRUPO)).thenReturn(List.of(
                new GrupoUsuarioTela(origem, calendario), new GrupoUsuarioTela(origem, foraDoTeto)));

        var copia = service.duplicar(GRUPO, new DuplicacaoGrupoUsuarioDto("Secretaria (cópia)"));

        assertThat(copia.padrao()).isFalse();
        ArgumentCaptor<List<GrupoUsuarioTela>> copiadas = ArgumentCaptor.forClass(List.class);
        verify(grupoTelaRepository).saveAll(copiadas.capture());
        assertThat(copiadas.getValue()).extracting(gt -> gt.getTela().getCodigo()).containsExactly("CALENDARIO");
        verify(membroRepository, never()).saveAll(anyIterable());
    }

    // ------------------------------------------------------------ apoio

    private static Perfil secretario() {
        var perfil = new Perfil();
        perfil.setId(PERFIL_SECRETARIO);
        perfil.setNome(PerfilNome.SECRETARIO);
        return perfil;
    }

    private static GrupoUsuario grupo(boolean padrao) {
        var grupo = new GrupoUsuario(secretario(), "Secretaria", null);
        grupo.setId(GRUPO);
        grupo.setPadrao(padrao);
        return grupo;
    }

    /** Catálogo não tem setters (muda só por migration); nos testes, o campo é preenchido direto. */
    private static Tela tela(String codigo) {
        var tela = new Tela();
        ReflectionTestUtils.setField(tela, "codigo", codigo);
        return tela;
    }

    private static Controle controle(String codigo, Tela tela) {
        var controle = new Controle();
        ReflectionTestUtils.setField(controle, "codigo", codigo);
        ReflectionTestUtils.setField(controle, "tela", tela);
        return controle;
    }

    private static CatalogoPermissaoService.Teto teto(List<Tela> telas, List<Controle> controles) {
        Map<String, Tela> porCodigoTela = new LinkedHashMap<>();
        telas.forEach(t -> porCodigoTela.put(t.getCodigo(), t));
        Map<String, Controle> porCodigoControle = new LinkedHashMap<>();
        controles.forEach(c -> porCodigoControle.put(c.getCodigo(), c));
        return new CatalogoPermissaoService.Teto(porCodigoTela, porCodigoControle);
    }
}
