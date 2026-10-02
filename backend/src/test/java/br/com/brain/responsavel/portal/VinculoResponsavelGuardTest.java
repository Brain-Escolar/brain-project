package br.com.brain.responsavel.portal;

import br.com.brain.aluno.Aluno;
import br.com.brain.autenticacao.DadosAutenticacao;
import br.com.brain.dadosPessoais.DadosPessoais;
import br.com.brain.exception.ErrosSistema.AcessoNegadoException;
import br.com.brain.responsavel.Responsavel;
import br.com.brain.responsavel.ResponsavelRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

/**
 * O guard e a unica coisa que separa um responsavel dos dados escolares de um
 * menor que nao e filho dele. Cada caso abaixo e um vazamento que nao pode
 * acontecer.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("VinculoResponsavelGuard")
class VinculoResponsavelGuardTest {

    private static final Long DADOS_PESSOAIS_ID = 100L;
    private static final Long FILHO_ID = 1L;
    private static final Long FILHO_DE_OUTRO_ID = 999L;

    @Mock
    private ResponsavelRepository responsavelRepository;

    @InjectMocks
    private VinculoResponsavelGuard guard;

    private DadosAutenticacao usuario;
    private Responsavel responsavel;
    private Aluno filho;

    @BeforeEach
    void setUp() {
        var dadosPessoais = new DadosPessoais();
        dadosPessoais.setId(DADOS_PESSOAIS_ID);

        usuario = new DadosAutenticacao();
        usuario.setDadosPessoais(dadosPessoais);

        filho = new Aluno();
        filho.setId(FILHO_ID);

        responsavel = new Responsavel();
        responsavel.setId(10L);
        responsavel.setFinanceiro(false);
        responsavel.setAlunos(List.of(filho));
    }

    private void responsavelCadastrado() {
        when(responsavelRepository.findByDadosPessoaisIdComAlunos(DADOS_PESSOAIS_ID))
                .thenReturn(Optional.of(responsavel));
    }

    @Test
    @DisplayName("devolve o aluno quando ha vinculo")
    void devolveAlunoVinculado() {
        responsavelCadastrado();

        assertThat(guard.assertPodeVer(usuario, FILHO_ID)).isSameAs(filho);
    }

    @Test
    @DisplayName("nega acesso ao aluno de outro responsavel")
    void negaAlunoDeOutroResponsavel() {
        responsavelCadastrado();

        assertThatThrownBy(() -> guard.assertPodeVer(usuario, FILHO_DE_OUTRO_ID))
                .isInstanceOf(AcessoNegadoException.class)
                .hasMessageContaining("vinculo");
    }

    @Test
    @DisplayName("nega quando o usuario logado nao tem cadastro de responsavel")
    void negaUsuarioSemCadastroDeResponsavel() {
        when(responsavelRepository.findByDadosPessoaisIdComAlunos(anyLong()))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> guard.assertPodeVer(usuario, FILHO_ID))
                .isInstanceOf(AcessoNegadoException.class);
    }

    @Test
    @DisplayName("nega quando nao ha usuario autenticado")
    void negaSemUsuario() {
        assertThatThrownBy(() -> guard.assertPodeVer(null, FILHO_ID))
                .isInstanceOf(AcessoNegadoException.class);
    }

    @Test
    @DisplayName("nega quando o alunoId nao e informado")
    void negaAlunoIdNulo() {
        responsavelCadastrado();

        assertThatThrownBy(() -> guard.assertPodeVer(usuario, null))
                .isInstanceOf(AcessoNegadoException.class);
    }

    @Test
    @DisplayName("financeiro: nega responsavel vinculado mas sem permissao financeira")
    void negaFinanceiroSemPermissao() {
        responsavelCadastrado();

        assertThatThrownBy(() -> guard.assertPodeVerFinanceiro(usuario, FILHO_ID))
                .isInstanceOf(AcessoNegadoException.class)
                .hasMessageContaining("financeiros");
    }

    @Test
    @DisplayName("financeiro: libera responsavel com a flag financeiro")
    void liberaFinanceiroComPermissao() {
        responsavel.setFinanceiro(true);
        responsavelCadastrado();

        assertThat(guard.assertPodeVerFinanceiro(usuario, FILHO_ID)).isSameAs(filho);
    }

    @Test
    @DisplayName("financeiro: a flag nao substitui o vinculo")
    void financeiroNaoIgnoraVinculo() {
        responsavel.setFinanceiro(true);
        responsavelCadastrado();

        assertThatThrownBy(() -> guard.assertPodeVerFinanceiro(usuario, FILHO_DE_OUTRO_ID))
                .isInstanceOf(AcessoNegadoException.class);
    }
}
