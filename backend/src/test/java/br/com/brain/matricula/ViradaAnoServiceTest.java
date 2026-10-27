package br.com.brain.matricula;

import br.com.brain.aluno.Aluno;
import br.com.brain.configuracaoAcademica.AnoLetivoService;
import br.com.brain.configuracaoAcademica.PeriodoLetivoRepository;
import br.com.brain.disciplina.DisciplinaRepository;
import br.com.brain.enums.StatusMatricula;
import br.com.brain.exception.ErrosSistema;
import br.com.brain.matricula.dto.RematriculaRequest;
import br.com.brain.matricula.dto.RematriculaRequest.Promocao;
import br.com.brain.relatorios.RelatoriosService;
import br.com.brain.relatorios.dto.RelatorioDto;
import br.com.brain.relatorios.dto.ResumoRelatorioDto;
import br.com.brain.serie.Serie;
import br.com.brain.turma.Turma;
import br.com.brain.turma.TurmaRepository;
import br.com.brain.unidade.Unidade;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Encerramento congela o resultado; rematrícula usa esse resultado para decidir
 * quem sobe de série e quem repete.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("ViradaAnoService")
class ViradaAnoServiceTest {

    @Mock
    private AnoLetivoService anoLetivoService;
    @Mock
    private PeriodoLetivoRepository periodoLetivoRepository;
    @Mock
    private MatriculaRepository matriculaRepository;
    @Mock
    private ResultadoDisciplinaRepository resultadoRepository;
    @Mock
    private TurmaRepository turmaRepository;
    @Mock
    private DisciplinaRepository disciplinaRepository;
    @Mock
    private RelatoriosService relatoriosService;
    @Mock
    private EntityManager em;

    @InjectMocks
    private ViradaAnoService service;

    private final Serie sexto = serie(6L);
    private final Serie setimo = serie(7L);
    private final Serie nono = serie(9L);

    @BeforeEach
    void setUp() {
        when(em.getReference(eq(Serie.class), anyLong())).thenAnswer(inv -> serie(inv.getArgument(1)));
        when(matriculaRepository.findByAlunoIdAndAnoLetivoOrderByIdDesc(anyLong(), eq(2027))).thenReturn(List.of());
    }

    @Test
    @DisplayName("encerrar: efetivada vira CONCLUIDA com o resultado do boletim; pré-matrícula é cancelada")
    void encerrar() {
        var turma = turma(2026, sexto);
        var efetivada = matricula(1L, StatusMatricula.EFETIVADA, sexto, null);
        efetivada.setTurma(turma);
        var pre = matricula(2L, StatusMatricula.PRE_MATRICULA, sexto, null);
        when(matriculaRepository.findDoAnoComAluno(eq(2026), anyCollection())).thenReturn(List.of(efetivada, pre));
        when(relatoriosService.gerarRelatorio(efetivada.getAluno(), turma, null)).thenReturn(relatorio("APROVADO"));

        var resultado = service.encerrar(2026);

        assertThat(efetivada.getStatus()).isEqualTo(StatusMatricula.CONCLUIDA);
        assertThat(efetivada.getSituacaoFinal()).isEqualTo("APROVADO");
        assertThat(efetivada.getFrequenciaFinal()).isEqualByComparingTo("92.5");
        assertThat(pre.getStatus()).isEqualTo(StatusMatricula.CANCELADA);
        assertThat(resultado.aprovadas()).isEqualTo(1);
        assertThat(resultado.preMatriculasCanceladas()).isEqualTo(1);
        verify(anoLetivoService).registrarEncerramento(2026);
    }

    @Test
    @DisplayName("encerrar: só o ano aberto")
    void encerrarSoAberto() {
        doThrow(ErrosSistema.OperacaoInvalidaException.com("Só o ano corrente pode ser encerrado"))
                .when(anoLetivoService).exigirAberto(2025);

        assertThatThrownBy(() -> service.encerrar(2025)).isInstanceOf(ErrosSistema.OperacaoInvalidaException.class);
        verify(anoLetivoService, never()).registrarEncerramento(2025);
    }

    @Test
    @DisplayName("rematricular: aprovado sobe, reprovado repete, concluinte e sem destino ficam de fora")
    void rematricular() {
        var aprovado = matricula(1L, StatusMatricula.CONCLUIDA, sexto, "APROVADO");
        var reprovado = matricula(2L, StatusMatricula.CONCLUIDA, sexto, "REPROVADO");
        var concluinte = matricula(3L, StatusMatricula.CONCLUIDA, nono, "APROVADO");
        var semDestino = matricula(4L, StatusMatricula.CONCLUIDA, setimo, "APROVADO");
        var semResultado = matricula(5L, StatusMatricula.CONCLUIDA, sexto, "EM_ANDAMENTO");
        when(matriculaRepository.findDoAnoComAluno(eq(2026), anyCollection()))
                .thenReturn(List.of(aprovado, reprovado, concluinte, semDestino, semResultado));

        var resultado = service.rematricular(2027, new RematriculaRequest(List.of(
                new Promocao(6L, 7L),
                new Promocao(9L, null))));

        assertThat(resultado.criadas()).isEqualTo(2);
        assertThat(resultado.concluintes()).isEqualTo(1);
        assertThat(resultado.semDestino()).isEqualTo(1);
        assertThat(resultado.semResultado()).isEqualTo(1);

        var criadas = ArgumentCaptor.forClass(Matricula.class);
        verify(matriculaRepository, times(2)).save(criadas.capture());
        assertThat(criadas.getAllValues()).extracting(m -> m.getSerie().getId()).containsExactly(7L, 6L);
        assertThat(criadas.getAllValues()).allMatch(m -> m.getStatus() == StatusMatricula.PRE_MATRICULA
                && m.getAnoLetivo() == 2027 && m.getTurma() == null);
    }

    @Test
    @DisplayName("rematricular: quem já tem matrícula viva no ano novo é pulado")
    void rematricularPulaQuemJaTem() {
        var aprovado = matricula(1L, StatusMatricula.CONCLUIDA, sexto, "APROVADO");
        when(matriculaRepository.findDoAnoComAluno(eq(2026), anyCollection())).thenReturn(List.of(aprovado));
        when(matriculaRepository.findByAlunoIdAndAnoLetivoOrderByIdDesc(1L, 2027))
                .thenReturn(List.of(matricula(1L, StatusMatricula.EFETIVADA, setimo, null)));

        var resultado = service.rematricular(2027, new RematriculaRequest(List.of(new Promocao(6L, 7L))));

        assertThat(resultado.jaMatriculados()).isEqualTo(1);
        verify(matriculaRepository, never()).save(any());
    }

    @Test
    @DisplayName("copiar turmas não duplica a que já existe no ano novo")
    void copiarTurmas() {
        var a = turma(2026, sexto);
        a.setNome("6º A");
        var b = turma(2026, sexto);
        b.setNome("6º B");
        when(turmaRepository.findByAnoLetivoOrderByNomeAsc(2026)).thenReturn(List.of(a, b));
        when(turmaRepository.existsByAnoLetivoAndNomeAndUnidadeIdAndSerieId(2027, "6º A", 1L, 6L)).thenReturn(true);

        var resultado = service.copiarTurmas(2027);

        assertThat(resultado.criadas()).isEqualTo(1);
        assertThat(resultado.jaExistiam()).isEqualTo(1);
        var nova = ArgumentCaptor.forClass(Turma.class);
        verify(turmaRepository).save(nova.capture());
        assertThat(nova.getValue().getNome()).isEqualTo("6º B");
        assertThat(nova.getValue().getAnoLetivo()).isEqualTo(2027);
    }

    private static RelatorioDto relatorio(String situacao) {
        var resumo = new ResumoRelatorioDto(new BigDecimal("7.5"), new BigDecimal("92.5"), 0, 1, 1, 3, 0, situacao);
        return new RelatorioDto(2026, new BigDecimal("6.0"), null, null, null, null, List.of(), null, resumo,
                List.of());
    }

    private static Matricula matricula(Long alunoId, StatusMatricula status, Serie serie, String situacao) {
        var aluno = new Aluno();
        aluno.setId(alunoId);
        aluno.setMatriculado(true);
        var m = new Matricula();
        m.setAluno(aluno);
        m.setAnoLetivo(2026);
        m.setStatus(status);
        m.setSerie(serie);
        m.setUnidade(unidade());
        m.setSituacaoFinal(situacao);
        m.setDataEfetivacao(LocalDate.of(2026, 2, 1));
        return m;
    }

    private static Turma turma(int ano, Serie serie) {
        var turma = new Turma();
        turma.setAnoLetivo(ano);
        turma.setSerie(serie);
        turma.setUnidade(unidade());
        turma.setNome("Turma");
        return turma;
    }

    private static Serie serie(Long id) {
        var serie = new Serie();
        serie.setId(id);
        return serie;
    }

    private static Unidade unidade() {
        var unidade = new Unidade();
        unidade.setId(1L);
        return unidade;
    }
}
