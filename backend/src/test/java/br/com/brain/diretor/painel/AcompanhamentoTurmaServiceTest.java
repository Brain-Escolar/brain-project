package br.com.brain.diretor.painel;

import br.com.brain.aluno.Aluno;
import br.com.brain.avaliacao.Avaliacao;
import br.com.brain.avaliacao.AvaliacaoTurma;
import br.com.brain.configuracaoAcademica.EscalaAvaliacao;
import br.com.brain.configuracaoAcademica.PeriodoLetivo;
import br.com.brain.diretor.painel.AcompanhamentoTurmaService.QuadroDeNotas;
import br.com.brain.diretor.painel.dto.AcompanhamentoTurmaDto.CriteriosDto;
import br.com.brain.diretor.painel.dto.AcompanhamentoTurmaDto.GeralDto;
import br.com.brain.disciplina.Disciplina;
import br.com.brain.enums.TipoAvaliacao;
import br.com.brain.enums.TipoEscala;
import br.com.brain.notas.Notas;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Regras do acompanhamento por turma da Direção: como a média de uma
 * disciplina é composta pelos períodos do recorte e quando um aluno passa a
 * aparecer "em atenção".
 */
@DisplayName("AcompanhamentoTurmaService")
class AcompanhamentoTurmaServiceTest {

    private static final EscalaAvaliacao ESCALA = new EscalaAvaliacao(
            TipoEscala.NUMERIC, BigDecimal.ZERO, BigDecimal.TEN, new BigDecimal("6.0"), 1, "0 a 10");

    /** Um período considerado, 3+ atrasos e 2+ anotações já disparam. */
    private static final CriteriosDto CRITERIOS = new CriteriosDto(
            new BigDecimal("6.0"), new BigDecimal("75.0"), 3, 2, 1);

    @Test
    @DisplayName("média da disciplina é a média dos períodos, não das avaliações soltas")
    void mediaDaDisciplinaPorPeriodo() {
        var primeiro = periodo(1, LocalDate.of(2026, 2, 1), LocalDate.of(2026, 4, 30));
        var segundo = periodo(2, LocalDate.of(2026, 5, 1), LocalDate.of(2026, 7, 15));

        var notas = List.of(
                nota(1L, 10L, "4.0", LocalDate.of(2026, 3, 10), TipoAvaliacao.PROVA),
                nota(1L, 10L, "6.0", LocalDate.of(2026, 4, 10), TipoAvaliacao.PROVA),
                nota(1L, 10L, "9.0", LocalDate.of(2026, 6, 10), TipoAvaliacao.PROVA));

        var quadro = new QuadroDeNotas(notas, List.of(primeiro, segundo), ESCALA);

        // 1º período = 5,0; 2º período = 9,0 → 7,0 (e não 6,3 da média simples).
        assertThat(quadro.media(1L, 10L)).isEqualByComparingTo("7.0");
    }

    @Test
    @DisplayName("recuperação e notas fora do recorte não entram na média")
    void ignoraRecuperacaoEForaDoRecorte() {
        var segundo = periodo(2, LocalDate.of(2026, 5, 1), LocalDate.of(2026, 7, 15));

        var notas = List.of(
                nota(1L, 10L, "3.0", LocalDate.of(2026, 3, 10), TipoAvaliacao.PROVA),
                nota(1L, 10L, "10.0", LocalDate.of(2026, 6, 20), TipoAvaliacao.RECUPERACAO),
                nota(1L, 10L, "8.0", LocalDate.of(2026, 6, 10), TipoAvaliacao.PROVA));

        var quadro = new QuadroDeNotas(notas, List.of(segundo), ESCALA);

        assertThat(quadro.media(1L, 10L)).isEqualByComparingTo("8.0");
        assertThat(quadro.media(1L, 99L)).isNull();
        assertThat(quadro.media(2L, 10L)).isNull();
    }

    @Test
    @DisplayName("aluno regular não tem motivo de atenção")
    void alunoRegular() {
        var geral = new GeralDto(new BigDecimal("7.5"), 1, 4, new BigDecimal("96.0"), 1);

        assertThat(AcompanhamentoTurmaService.motivosAtencao(geral, 2, CRITERIOS)).isEmpty();
    }

    @Test
    @DisplayName("média baixa, frequência abaixo de 75%, atrasos e anotações viram motivos")
    void todosOsMotivos() {
        var geral = new GeralDto(new BigDecimal("5.4"), 4, 40, new BigDecimal("70.0"), 2);

        assertThat(AcompanhamentoTurmaService.motivosAtencao(geral, 3, CRITERIOS)).containsExactly(
                "média abaixo de 6,0",
                "frequência abaixo de 75%",
                "3 atrasos",
                "2 anotações de comportamento");
    }

    @Test
    @DisplayName("com média boa, três disciplinas abaixo já pedem atenção")
    void disciplinasAbaixoComMediaBoa() {
        var geral = new GeralDto(new BigDecimal("6.8"), 3, 0, null, 0);

        assertThat(AcompanhamentoTurmaService.motivosAtencao(geral, 0, CRITERIOS))
                .containsExactly("3 disciplinas abaixo da média");
    }

    @Test
    @DisplayName("no acumulado, os limites de atrasos e anotações escalam com os períodos")
    void limitesEscalamComPeriodos() {
        var acumulado = new CriteriosDto(new BigDecimal("6.0"), new BigDecimal("75.0"), 3, 2, 3);
        var geral = new GeralDto(new BigDecimal("8.0"), 0, 0, new BigDecimal("98.0"), 5);

        // 3 períodos: precisa de 9 atrasos e 6 anotações.
        assertThat(AcompanhamentoTurmaService.motivosAtencao(geral, 8, acumulado)).isEmpty();
        assertThat(AcompanhamentoTurmaService.motivosAtencao(geral, 9, acumulado)).containsExactly("9 atrasos");
    }

    @Test
    @DisplayName("frequência é nula sem chamada e arredonda em uma casa")
    void frequencia() {
        assertThat(AcompanhamentoTurmaService.frequencia(0, 0)).isNull();
        assertThat(AcompanhamentoTurmaService.frequencia(3, 1)).isEqualByComparingTo("66.7");
    }

    private static PeriodoLetivo periodo(int sequencia, LocalDate inicio, LocalDate fim) {
        var periodo = new PeriodoLetivo();
        periodo.setId((long) sequencia);
        periodo.setSequencia(sequencia);
        periodo.setNome(sequencia + "º Bimestre");
        periodo.setAnoLetivo(inicio.getYear());
        periodo.setDataInicio(inicio);
        periodo.setDataFim(fim);
        return periodo;
    }

    private static Notas nota(Long alunoId, Long disciplinaId, String valor, LocalDate data, TipoAvaliacao tipo) {
        var aluno = new Aluno();
        aluno.setId(alunoId);
        var disciplina = new Disciplina();
        disciplina.setId(disciplinaId);
        var avaliacao = new Avaliacao();
        avaliacao.setDisciplina(disciplina);
        avaliacao.setTipo(tipo);
        var avaliacaoTurma = new AvaliacaoTurma();
        avaliacaoTurma.setAvaliacao(avaliacao);

        var nota = new Notas();
        nota.setAluno(aluno);
        nota.setAvaliacaoTurma(avaliacaoTurma);
        nota.setPontuacao(new BigDecimal(valor));
        nota.setPeriodoReferencia(data);
        return nota;
    }
}
