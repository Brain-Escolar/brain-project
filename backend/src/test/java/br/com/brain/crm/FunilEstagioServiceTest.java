package br.com.brain.crm;

import br.com.brain.crm.dto.AtualizacaoFunilEstagioDto;
import br.com.brain.crm.dto.CadastroFunilEstagioDto;
import br.com.brain.crm.dto.MoverFunilEstagioDto;
import br.com.brain.exception.ErrosSistema.OperacaoInvalidaException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

/**
 * Estagios do funil sao reordenados a mao pela secretaria (botoes de subir/descer),
 * entao o swap de `ordem` precisa ficar consistente mesmo nas bordas (primeiro/ultimo
 * estagio) — e um teste de fronteira que falhando silenciosamente bagunça o Kanban inteiro.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("FunilEstagioService")
class FunilEstagioServiceTest {

    @Mock
    private FunilEstagioRepository repository;

    @InjectMocks
    private FunilEstagioService service;

    private FunilEstagio estagio(Long id, String nome, int ordem) {
        var e = new FunilEstagio();
        e.setId(id);
        e.setNome(nome);
        e.setOrdem(ordem);
        return e;
    }

    @BeforeEach
    void setUp() {
        lenient().when(repository.save(any(FunilEstagio.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    @DisplayName("mover CIMA: troca a ordem com o estagio anterior")
    void moverCimaTrocaOrdemComAnterior() {
        var atual = estagio(2L, "Qualificacao", 2);
        var anterior = estagio(1L, "Novo lead", 1);
        when(repository.findById(2L)).thenReturn(Optional.of(atual));
        when(repository.findByOrdem(1)).thenReturn(Optional.of(anterior));

        service.mover(2L, MoverFunilEstagioDto.CIMA);

        assertThat(atual.getOrdem()).isEqualTo(1);
        assertThat(anterior.getOrdem()).isEqualTo(2);
    }

    @Test
    @DisplayName("mover BAIXO: troca a ordem com o proximo estagio")
    void moverBaixoTrocaOrdemComProximo() {
        var atual = estagio(2L, "Qualificacao", 2);
        var proximo = estagio(3L, "Visita agendada", 3);
        when(repository.findById(2L)).thenReturn(Optional.of(atual));
        when(repository.findByOrdem(3)).thenReturn(Optional.of(proximo));

        service.mover(2L, MoverFunilEstagioDto.BAIXO);

        assertThat(atual.getOrdem()).isEqualTo(3);
        assertThat(proximo.getOrdem()).isEqualTo(2);
    }

    @Test
    @DisplayName("mover CIMA no primeiro estagio: lanca OperacaoInvalidaException")
    void moverCimaSemVizinhoLancaExcecao() {
        var primeiro = estagio(1L, "Novo lead", 1);
        when(repository.findById(1L)).thenReturn(Optional.of(primeiro));
        when(repository.findByOrdem(0)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.mover(1L, MoverFunilEstagioDto.CIMA))
                .isInstanceOf(OperacaoInvalidaException.class);
    }

    @Test
    @DisplayName("mover BAIXO no ultimo estagio: lanca OperacaoInvalidaException")
    void moverBaixoSemVizinhoLancaExcecao() {
        var ultimo = estagio(7L, "Matriculado", 7);
        when(repository.findById(7L)).thenReturn(Optional.of(ultimo));
        when(repository.findByOrdem(8)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.mover(7L, MoverFunilEstagioDto.BAIXO))
                .isInstanceOf(OperacaoInvalidaException.class);
    }

    @Test
    @DisplayName("atualizar: so troca os campos informados, preservando o resto")
    void atualizarAtualizaSomenteCamposInformados() {
        var estagio = estagio(1L, "Novo lead", 1);
        estagio.setSlaDias(1);
        when(repository.findById(1L)).thenReturn(Optional.of(estagio));

        service.atualizar(1L, new AtualizacaoFunilEstagioDto(null, 3));

        assertThat(estagio.getNome()).isEqualTo("Novo lead");
        assertThat(estagio.getSlaDias()).isEqualTo(3);

        service.atualizar(1L, new AtualizacaoFunilEstagioDto("Lead recebido", null));

        assertThat(estagio.getNome()).isEqualTo("Lead recebido");
        assertThat(estagio.getSlaDias()).isEqualTo(3);
    }

    @Test
    @DisplayName("cadastrar: cria um novo estagio com os dados informados")
    void cadastrarCriaEstagio() {
        var novo = service.cadastrar(new CadastroFunilEstagioDto("Proposta", 5, 5));

        assertThat(novo.getNome()).isEqualTo("Proposta");
        assertThat(novo.getOrdem()).isEqualTo(5);
        assertThat(novo.getSlaDias()).isEqualTo(5);
    }
}
