package br.com.brain.dadosPessoais;

import br.com.brain.aluno.Aluno;
import br.com.brain.coordenador.Coordenador;
import br.com.brain.diretor.Diretor;
import br.com.brain.orientador.Orientador;
import br.com.brain.professor.Professor;
import br.com.brain.rh.Rh;
import br.com.brain.secretario.Secretario;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

/**
 * DadosPessoais é bytecode-enhanced pelo Hibernate para sincronizar os dois
 * lados de cada associação bidirecional (ver EnhancementContext no build).
 * Secretario/Rh/Diretor/Coordenador/Orientador são @OneToOne no lado dono,
 * mas o lado inverso em DadosPessoais estava mapeado como @OneToMany
 * (List<X>) — a inconsistência de cardinalidade fazia o setter gerado tentar
 * gravar a própria entidade num campo que o enhancer tratava como List,
 * estourando ClassCastException em runtime (só aparecia ao chamar o setter
 * de verdade, fora de um teste com mocks — passou despercebido até o
 * cadastro de Secretario ir para produção). O fix foi tornar o lado inverso
 * também singular (@OneToOne), igual a Aluno/Professor/Responsavel, que
 * sempre estiveram corretos.
 */
@DisplayName("DadosPessoais — sincronização bidirecional das associações @OneToOne")
class DadosPessoaisAssociacaoBidirecionalTest {

    @Test
    @DisplayName("Secretario.setDadosPessoais não lança ClassCastException")
    void secretario() {
        var dadosPessoais = new DadosPessoais();
        var secretario = new Secretario();

        assertThatCode(() -> secretario.setDadosPessoais(dadosPessoais)).doesNotThrowAnyException();
        assertThat(secretario.getDadosPessoais()).isSameAs(dadosPessoais);
    }

    @Test
    @DisplayName("Rh.setDadosPessoais não lança ClassCastException")
    void rh() {
        var dadosPessoais = new DadosPessoais();
        var rh = new Rh();

        assertThatCode(() -> rh.setDadosPessoais(dadosPessoais)).doesNotThrowAnyException();
        assertThat(rh.getDadosPessoais()).isSameAs(dadosPessoais);
    }

    @Test
    @DisplayName("Diretor.setDadosPessoais não lança ClassCastException")
    void diretor() {
        var dadosPessoais = new DadosPessoais();
        var diretor = new Diretor();

        assertThatCode(() -> diretor.setDadosPessoais(dadosPessoais)).doesNotThrowAnyException();
        assertThat(diretor.getDadosPessoais()).isSameAs(dadosPessoais);
    }

    @Test
    @DisplayName("Coordenador.setDadosPessoais não lança ClassCastException")
    void coordenador() {
        var dadosPessoais = new DadosPessoais();
        var coordenador = new Coordenador();

        assertThatCode(() -> coordenador.setDadosPessoais(dadosPessoais)).doesNotThrowAnyException();
        assertThat(coordenador.getDadosPessoais()).isSameAs(dadosPessoais);
    }

    @Test
    @DisplayName("Orientador.setDadosPessoais não lança ClassCastException")
    void orientador() {
        var dadosPessoais = new DadosPessoais();
        var orientador = new Orientador();

        assertThatCode(() -> orientador.setDadosPessoais(dadosPessoais)).doesNotThrowAnyException();
        assertThat(orientador.getDadosPessoais()).isSameAs(dadosPessoais);
    }

    @Test
    @DisplayName("Aluno e Professor continuam funcionando (já eram @OneToOne corretos dos dois lados)")
    void relacoesJaCorretasContinuamOk() {
        var dadosPessoaisAluno = new DadosPessoais();
        var aluno = new Aluno();
        assertThatCode(() -> aluno.setDadosPessoais(dadosPessoaisAluno)).doesNotThrowAnyException();

        var dadosPessoaisProfessor = new DadosPessoais();
        var professor = new Professor();
        assertThatCode(() -> professor.setDadosPessoais(dadosPessoaisProfessor)).doesNotThrowAnyException();
    }
}
