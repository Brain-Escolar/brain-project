package br.com.brain.professor;

import br.com.brain.dadosPessoais.DadosPessoais;
import br.com.brain.exception.ErrosSistema;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.CALLS_REAL_METHODS;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;

/** Professor desligado nao recebe atribuicao nova, mas nao trava a edicao do que ja era dele. */
@DisplayName("ProfessorRepository - atribuicao a professor ativo")
class ProfessorRepositoryAtivoTest {

    private final ProfessorRepository repository = mock(ProfessorRepository.class, CALLS_REAL_METHODS);

    private static Professor professor(Long id, boolean ativo) {
        var dp = new DadosPessoais();
        dp.setNome("Prof " + id);
        var p = new Professor();
        p.setId(id);
        p.setAtivo(ativo);
        p.setDadosPessoais(dp);
        return p;
    }

    @Test
    @DisplayName("ativo: devolve o professor")
    void ativoPassa() {
        var ativo = professor(1L, true);
        doReturn(Optional.of(ativo)).when(repository).findById(1L);

        assertThat(repository.exigirAtivo(1L)).isSameAs(ativo);
    }

    @Test
    @DisplayName("inativo: recusa a atribuicao nova")
    void inativoRecusa() {
        doReturn(Optional.of(professor(2L, false))).when(repository).findById(2L);

        assertThatThrownBy(() -> repository.exigirAtivo(2L))
                .isInstanceOf(ErrosSistema.OperacaoInvalidaException.class);
    }

    @Test
    @DisplayName("edicao mantendo o professor (mesmo inativo): permitida")
    void edicaoMantendoInativoPassa() {
        var atual = professor(2L, false);

        assertThat(repository.exigirAtivoSeMudou(2L, atual)).isSameAs(atual);
    }

    @Test
    @DisplayName("edicao trocando para inativo: recusada")
    void trocaParaInativoRecusa() {
        doReturn(Optional.of(professor(3L, false))).when(repository).findById(3L);

        assertThatThrownBy(() -> repository.exigirAtivoSeMudou(3L, professor(1L, true)))
                .isInstanceOf(ErrosSistema.OperacaoInvalidaException.class);
    }
}
