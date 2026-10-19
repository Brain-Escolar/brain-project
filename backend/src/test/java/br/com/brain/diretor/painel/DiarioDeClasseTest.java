package br.com.brain.diretor.painel;

import br.com.brain.diretor.painel.dto.AcompanhamentoProfessorDto.SituacaoAula;
import br.com.brain.diretor.painel.dto.AcompanhamentoProfessorDto.SituacaoAvaliacao;
import br.com.brain.diretor.painel.dto.ProfessoresDiretorDto.SituacaoProfessor;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import static org.assertj.core.api.Assertions.assertThat;

/** Quando uma aula, uma avaliação e o próprio professor ficam em dia, pendentes ou por vir. */
@DisplayName("DiarioDeClasse")
class DiarioDeClasseTest {

    /** Terça-feira, 10h. */
    private static final LocalDateTime AGORA = LocalDateTime.of(2026, 10, 20, 10, 0);
    private static final LocalDate HOJE = AGORA.toLocalDate();

    @Test
    @DisplayName("a semana vai de segunda a sexta, mesmo pedida no meio dela")
    void semanaDeSegundaASexta() {
        assertThat(DiarioDeClasse.semanaDe(HOJE)).containsExactly(
                LocalDate.of(2026, 10, 19), HOJE, LocalDate.of(2026, 10, 21), LocalDate.of(2026, 10, 22),
                LocalDate.of(2026, 10, 23));
        assertThat(DiarioDeClasse.semanaDe(LocalDate.of(2026, 10, 19))).first().isEqualTo(LocalDate.of(2026, 10, 19));
    }

    @Test
    @DisplayName("no sábado e no domingo, a semana é a que acabou de passar")
    void semanaNoFimDeSemana() {
        assertThat(DiarioDeClasse.semanaDe(LocalDate.of(2026, 10, 24))).first().isEqualTo(LocalDate.of(2026, 10, 19));
        assertThat(DiarioDeClasse.semanaDe(LocalDate.of(2026, 10, 25))).last().isEqualTo(LocalDate.of(2026, 10, 23));
    }

    @Test
    @DisplayName("aula com conteúdo ou chamada está registrada, mesmo no futuro")
    void aulaRegistrada() {
        assertThat(DiarioDeClasse.situacaoAula(true, HOJE.minusDays(3), null, AGORA)).isEqualTo(SituacaoAula.REGISTRADA);
        assertThat(DiarioDeClasse.situacaoAula(true, HOJE, LocalTime.of(11, 0), AGORA)).isEqualTo(SituacaoAula.REGISTRADA);
    }

    @Test
    @DisplayName("aula de dia anterior sem registro está pendente")
    void aulaDeOntemSemRegistro() {
        assertThat(DiarioDeClasse.situacaoAula(false, HOJE.minusDays(1), LocalTime.of(11, 0), AGORA))
                .isEqualTo(SituacaoAula.PENDENTE);
    }

    @Test
    @DisplayName("aula de hoje só fica pendente depois de terminar")
    void aulaDeHoje() {
        assertThat(DiarioDeClasse.situacaoAula(false, HOJE, LocalTime.of(9, 50), AGORA)).isEqualTo(SituacaoAula.PENDENTE);
        assertThat(DiarioDeClasse.situacaoAula(false, HOJE, LocalTime.of(10, 0), AGORA)).isEqualTo(SituacaoAula.PENDENTE);
        assertThat(DiarioDeClasse.situacaoAula(false, HOJE, LocalTime.of(10, 50), AGORA)).isEqualTo(SituacaoAula.PREVISTA);
    }

    @Test
    @DisplayName("aula de hoje sem horário cadastrado só pende no dia seguinte")
    void aulaDeHojeSemHorario() {
        assertThat(DiarioDeClasse.situacaoAula(false, HOJE, null, AGORA)).isEqualTo(SituacaoAula.PREVISTA);
    }

    @Test
    @DisplayName("avaliação com nota de todos os matriculados está lançada")
    void avaliacaoLancada() {
        assertThat(DiarioDeClasse.situacaoAvaliacao(HOJE.minusDays(20), HOJE.minusDays(10), 30, 30, HOJE))
                .isEqualTo(SituacaoAvaliacao.LANCADA);
    }

    @Test
    @DisplayName("avaliação com notas faltando atrasa no dia seguinte ao prazo")
    void avaliacaoParcialAtrasada() {
        assertThat(DiarioDeClasse.situacaoAvaliacao(HOJE.minusDays(20), HOJE.minusDays(1), 12, 30, HOJE))
                .isEqualTo(SituacaoAvaliacao.ATRASADA);
        assertThat(DiarioDeClasse.situacaoAvaliacao(HOJE.minusDays(20), HOJE, 12, 30, HOJE))
                .isEqualTo(SituacaoAvaliacao.NO_PRAZO);
    }

    @Test
    @DisplayName("avaliação ainda não aplicada está agendada")
    void avaliacaoAgendada() {
        assertThat(DiarioDeClasse.situacaoAvaliacao(HOJE.plusDays(3), HOJE.plusDays(10), 0, 30, HOJE))
                .isEqualTo(SituacaoAvaliacao.AGENDADA);
    }

    @Test
    @DisplayName("turma sem matriculados precisa de ao menos uma nota para a avaliação contar como lançada")
    void avaliacaoDeTurmaVazia() {
        assertThat(DiarioDeClasse.situacaoAvaliacao(HOJE.minusDays(5), HOJE.minusDays(1), 0, 0, HOJE))
                .isEqualTo(SituacaoAvaliacao.ATRASADA);
        assertThat(DiarioDeClasse.situacaoAvaliacao(HOJE.minusDays(5), HOJE.minusDays(1), 1, 0, HOJE))
                .isEqualTo(SituacaoAvaliacao.LANCADA);
    }

    @Test
    @DisplayName("situação do professor: inativo e sem grade vêm antes das pendências")
    void situacaoDoProfessor() {
        assertThat(DiarioDeClasse.situacaoProfessor(false, true, 3, 0)).isEqualTo(SituacaoProfessor.INATIVO);
        assertThat(DiarioDeClasse.situacaoProfessor(true, false, 0, 0)).isEqualTo(SituacaoProfessor.SEM_GRADE);
        assertThat(DiarioDeClasse.situacaoProfessor(true, true, 0, 1)).isEqualTo(SituacaoProfessor.PENDENTE);
        assertThat(DiarioDeClasse.situacaoProfessor(true, true, 2, 0)).isEqualTo(SituacaoProfessor.PENDENTE);
        assertThat(DiarioDeClasse.situacaoProfessor(true, true, 0, 0)).isEqualTo(SituacaoProfessor.EM_DIA);
    }
}
