package br.com.brain.matricula;

import br.com.brain.aluno.Aluno;
import br.com.brain.configuracaoAcademica.AnoLetivoService;
import br.com.brain.enums.StatusMatricula;
import br.com.brain.serie.Serie;
import br.com.brain.turma.Turma;
import br.com.brain.unidade.Unidade;
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

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * A matrícula do ano é a fonte da verdade de "aluno X na turma Y"; o aluno só
 * guarda o cache do ano corrente.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("EnturmacaoService")
class EnturmacaoServiceTest {

    private static final int ANO_CORRENTE = 2026;

    @Mock
    private MatriculaRepository matriculaRepository;
    @Mock
    private AnoLetivoService anoLetivoService;

    @InjectMocks
    private EnturmacaoService service;

    private Aluno aluno;

    @BeforeEach
    void setUp() {
        aluno = new Aluno();
        aluno.setId(1L);
        when(anoLetivoService.anoCorrente()).thenReturn(ANO_CORRENTE);
    }

    @Test
    @DisplayName("aluno sem matrícula no ano ganha uma EFETIVADA na turma, e o cache acompanha")
    void criaMatriculaQuandoFalta() {
        var turma = turma(10L, ANO_CORRENTE);
        when(matriculaRepository.findByAlunoIdAndAnoLetivoOrderByIdDesc(1L, ANO_CORRENTE)).thenReturn(List.of());

        service.enturmar(aluno, turma);

        var salva = ArgumentCaptor.forClass(Matricula.class);
        verify(matriculaRepository).save(salva.capture());
        assertThat(salva.getValue().getStatus()).isEqualTo(StatusMatricula.EFETIVADA);
        assertThat(salva.getValue().getTurma()).isSameAs(turma);
        assertThat(salva.getValue().getSerie()).isSameAs(turma.getSerie());
        assertThat(aluno.getTurma()).isSameAs(turma);
    }

    @Test
    @DisplayName("remanejamento troca a turma da matrícula viva, sem criar outra")
    void remanejaNaMesmaMatricula() {
        var antiga = turma(10L, ANO_CORRENTE);
        var nova = turma(11L, ANO_CORRENTE);
        var viva = matricula(5L, StatusMatricula.EFETIVADA, antiga);
        when(matriculaRepository.findByAlunoIdAndAnoLetivoOrderByIdDesc(1L, ANO_CORRENTE)).thenReturn(List.of(viva));

        var resultado = service.enturmar(aluno, nova);

        assertThat(resultado).isSameAs(viva);
        assertThat(viva.getTurma()).isSameAs(nova);
    }

    @Test
    @DisplayName("enturmar no ano seguinte não mexe na turma que o aluno vê hoje")
    void anoSeguinteNaoMexeNoCache() {
        var atual = turma(10L, ANO_CORRENTE);
        aluno.setTurma(atual);
        var proxima = turma(20L, ANO_CORRENTE + 1);
        when(matriculaRepository.findByAlunoIdAndAnoLetivoOrderByIdDesc(1L, ANO_CORRENTE + 1)).thenReturn(List.of());

        service.enturmar(aluno, proxima);

        assertThat(aluno.getTurma()).isSameAs(atual);
        verify(anoLetivoService).garantir(ANO_CORRENTE + 1);
    }

    @Test
    @DisplayName("desmatricular cancela a matrícula mas preserva a turma, para o histórico")
    void encerrarPreservaTurma() {
        var turma = turma(10L, ANO_CORRENTE);
        var viva = matricula(5L, StatusMatricula.EFETIVADA, turma);
        when(matriculaRepository.findByAlunoIdAndAnoLetivoOrderByIdDesc(1L, ANO_CORRENTE)).thenReturn(List.of(viva));

        service.encerrarNoAnoCorrente(aluno, "Mudou de cidade", LocalDate.of(2026, 6, 1));

        assertThat(viva.getStatus()).isEqualTo(StatusMatricula.CANCELADA);
        assertThat(viva.getTurma()).isSameAs(turma);
        assertThat(viva.getMotivoSaida()).isEqualTo("Mudou de cidade");
    }

    @Test
    @DisplayName("rematricular reativa a matrícula cancelada do ano")
    void reativaCancelada() {
        var cancelada = matricula(5L, StatusMatricula.CANCELADA, turma(10L, ANO_CORRENTE));
        cancelada.setDataSaida(LocalDate.of(2026, 6, 1));
        when(matriculaRepository.findByAlunoIdAndAnoLetivoOrderByIdDesc(1L, ANO_CORRENTE))
                .thenReturn(List.of(cancelada));

        service.reativarNoAnoCorrente(aluno);

        assertThat(cancelada.getStatus()).isEqualTo(StatusMatricula.EFETIVADA);
        assertThat(cancelada.getDataSaida()).isNull();
    }

    private static Turma turma(Long id, int ano) {
        var turma = new Turma();
        turma.setId(id);
        turma.setNome("Turma " + id);
        turma.setAnoLetivo(ano);
        var serie = new Serie();
        serie.setId(100L);
        turma.setSerie(serie);
        var unidade = new Unidade();
        unidade.setId(200L);
        turma.setUnidade(unidade);
        return turma;
    }

    private Matricula matricula(Long id, StatusMatricula status, Turma turma) {
        var m = new Matricula();
        m.setId(id);
        m.setAluno(aluno);
        m.setAnoLetivo(turma.getAnoLetivo());
        m.setStatus(status);
        m.setTurma(turma);
        m.setSerie(turma.getSerie());
        m.setUnidade(turma.getUnidade());
        m.setDataEfetivacao(LocalDate.of(turma.getAnoLetivo(), 2, 1));
        return m;
    }
}
