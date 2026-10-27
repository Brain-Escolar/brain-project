package br.com.brain.configuracaoAcademica;

import br.com.brain.configuracaoAcademica.dto.PeriodosLetivosRequest;
import br.com.brain.configuracaoAcademica.dto.PeriodosLetivosRequest.Periodo;
import br.com.brain.enums.StatusAnoLetivo;
import br.com.brain.exception.ErrosSistema;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Ciclo de vida do ano letivo: qual é o corrente, quando um ano nasce sozinho e
 * o que o calendário de períodos aceita.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("AnoLetivoService")
class AnoLetivoServiceTest {

    @Mock
    private AnoLetivoRepository anoLetivoRepository;
    @Mock
    private PeriodoLetivoRepository periodoLetivoRepository;
    @Mock
    private ApplicationEventPublisher eventos;

    @InjectMocks
    private AnoLetivoService service;

    @Nested
    @DisplayName("ano corrente")
    class Corrente {

        @Test
        @DisplayName("é o ano ABERTO, mesmo que o calendário já tenha virado")
        void anoAberto() {
            when(anoLetivoRepository.findFirstByStatus(StatusAnoLetivo.ABERTO))
                    .thenReturn(Optional.of(ano(2025, StatusAnoLetivo.ABERTO)));

            assertThat(service.anoCorrente()).isEqualTo(2025);
        }

        @Test
        @DisplayName("sem ano aberto, cai no ano do calendário")
        void semAnoAberto() {
            when(anoLetivoRepository.findFirstByStatus(StatusAnoLetivo.ABERTO)).thenReturn(Optional.empty());

            assertThat(service.anoCorrente()).isEqualTo(LocalDate.now().getYear());
        }
    }

    @Nested
    @DisplayName("garantir")
    class Garantir {

        @Test
        @DisplayName("cria o ano em PLANEJAMENTO copiando o calendário do ano anterior")
        void criaCopiandoAnterior() {
            when(anoLetivoRepository.findById(2027)).thenReturn(Optional.empty());
            when(periodoLetivoRepository.findByAnoLetivoOrderBySequenciaAsc(2026)).thenReturn(List.of(
                    periodo(2026, 1, "1º Trimestre", LocalDate.of(2026, 2, 2), LocalDate.of(2026, 5, 15)),
                    periodo(2026, 2, "2º Trimestre", LocalDate.of(2026, 5, 18), LocalDate.of(2026, 8, 28))));

            var criado = service.garantir(2027);

            assertThat(criado.getStatus()).isEqualTo(StatusAnoLetivo.PLANEJAMENTO);
            assertThat(criado.getDataInicio()).isEqualTo(LocalDate.of(2027, 2, 2));
            assertThat(criado.getDataFim()).isEqualTo(LocalDate.of(2027, 8, 28));

            @SuppressWarnings("unchecked")
            ArgumentCaptor<List<PeriodoLetivo>> periodos = ArgumentCaptor.forClass(List.class);
            verify(periodoLetivoRepository).saveAll(periodos.capture());
            assertThat(periodos.getValue()).extracting(PeriodoLetivo::getNome)
                    .containsExactly("1º Trimestre", "2º Trimestre");
            assertThat(periodos.getValue()).allMatch(p -> p.getAnoLetivo() == 2027);
        }

        @Test
        @DisplayName("sem ano anterior, nasce com 4 bimestres")
        void criaComBimestres() {
            when(anoLetivoRepository.findById(2027)).thenReturn(Optional.empty());
            when(periodoLetivoRepository.findByAnoLetivoOrderBySequenciaAsc(2026)).thenReturn(List.of());

            service.garantir(2027);

            @SuppressWarnings("unchecked")
            ArgumentCaptor<List<PeriodoLetivo>> periodos = ArgumentCaptor.forClass(List.class);
            verify(periodoLetivoRepository).saveAll(periodos.capture());
            assertThat(periodos.getValue()).hasSize(4);
        }

        @Test
        @DisplayName("recusa ano encerrado")
        void recusaEncerrado() {
            var encerrado = ano(2024, StatusAnoLetivo.ENCERRADO);
            when(anoLetivoRepository.findById(2024)).thenReturn(Optional.of(encerrado));

            assertThatThrownBy(() -> service.garantir(2024))
                    .isInstanceOf(ErrosSistema.OperacaoInvalidaException.class)
                    .hasMessageContaining("encerrado");
            verify(periodoLetivoRepository, never()).saveAll(anyList());
        }
    }

    @Nested
    @DisplayName("abrir")
    class Abrir {

        @Test
        @DisplayName("não abre um segundo ano enquanto outro está aberto")
        void umAbertoPorVez() {
            when(anoLetivoRepository.findById(2027)).thenReturn(Optional.of(ano(2027, StatusAnoLetivo.PLANEJAMENTO)));
            when(anoLetivoRepository.findFirstByStatus(StatusAnoLetivo.ABERTO))
                    .thenReturn(Optional.of(ano(2026, StatusAnoLetivo.ABERTO)));

            assertThatThrownBy(() -> service.abrir(2027))
                    .isInstanceOf(ErrosSistema.OperacaoInvalidaException.class)
                    .hasMessageContaining("2026");
            verify(anoLetivoRepository, never()).save(any());
        }

        @Test
        @DisplayName("ano encerrado não volta a abrir por aqui")
        void naoReabreEncerrado() {
            when(anoLetivoRepository.findById(2025)).thenReturn(Optional.of(ano(2025, StatusAnoLetivo.ENCERRADO)));

            assertThatThrownBy(() -> service.abrir(2025))
                    .isInstanceOf(ErrosSistema.OperacaoInvalidaException.class);
        }

        @Test
        @DisplayName("abre ano em planejamento quando nenhum outro está aberto")
        void abre() {
            var planejado = ano(2027, StatusAnoLetivo.PLANEJAMENTO);
            when(anoLetivoRepository.findById(2027)).thenReturn(Optional.of(planejado));
            when(anoLetivoRepository.findFirstByStatus(StatusAnoLetivo.ABERTO)).thenReturn(Optional.empty());

            var dto = service.abrir(2027);

            assertThat(dto.status()).isEqualTo(StatusAnoLetivo.ABERTO);
            assertThat(planejado.getAbertoEm()).isNotNull();
            verify(eventos).publishEvent(new AnoLetivoAberto(2027));
        }
    }

    @Nested
    @DisplayName("calendário de períodos")
    class Calendario {

        @Test
        @DisplayName("aceita períodos em ordem, terminando até janeiro do ano seguinte")
        void aceitaCalendarioValido() {
            var periodos = List.of(
                    new Periodo("1º Semestre", LocalDate.of(2027, 2, 1), LocalDate.of(2027, 7, 10)),
                    new Periodo("2º Semestre", LocalDate.of(2027, 8, 1), LocalDate.of(2028, 1, 20)));

            assertThatCode(() -> AnoLetivoService.validarCalendario(2027, periodos)).doesNotThrowAnyException();
        }

        @Test
        @DisplayName("recusa períodos sobrepostos")
        void recusaSobreposicao() {
            var periodos = List.of(
                    new Periodo("1º Bimestre", LocalDate.of(2027, 2, 1), LocalDate.of(2027, 4, 30)),
                    new Periodo("2º Bimestre", LocalDate.of(2027, 4, 30), LocalDate.of(2027, 7, 10)));

            assertThatThrownBy(() -> AnoLetivoService.validarCalendario(2027, periodos))
                    .hasMessageContaining("2º período");
        }

        @Test
        @DisplayName("recusa período fora do ano")
        void recusaForaDoAno() {
            var periodos = List.of(new Periodo("1º Bimestre", LocalDate.of(2026, 12, 1), LocalDate.of(2027, 4, 30)));

            assertThatThrownBy(() -> AnoLetivoService.validarCalendario(2027, periodos))
                    .hasMessageContaining("começar em 2027");
        }

        @Test
        @DisplayName("recusa fim antes do início")
        void recusaFimAntesDoInicio() {
            var periodos = List.of(new Periodo("1º Bimestre", LocalDate.of(2027, 4, 30), LocalDate.of(2027, 2, 1)));

            assertThatThrownBy(() -> AnoLetivoService.validarCalendario(2027, periodos))
                    .hasMessageContaining("anterior à de início");
        }

        @Test
        @DisplayName("ano encerrado não aceita novo calendário")
        void recusaEmAnoEncerrado() {
            var encerrado = ano(2025, StatusAnoLetivo.ENCERRADO);
            when(anoLetivoRepository.findById(2025)).thenReturn(Optional.of(encerrado));
            var pedido = new PeriodosLetivosRequest(List.of(
                    new Periodo("Anual", LocalDate.of(2025, 2, 1), LocalDate.of(2025, 12, 1))));

            assertThatThrownBy(() -> service.salvarPeriodos(2025, pedido))
                    .isInstanceOf(ErrosSistema.OperacaoInvalidaException.class);
            verify(periodoLetivoRepository, never()).save(any());
        }

        @Test
        @DisplayName("atualiza no lugar, remove o que sobra e ajusta as datas do ano")
        void atualizaNoLugar() {
            var ano = ano(2027, StatusAnoLetivo.PLANEJAMENTO);
            when(anoLetivoRepository.findById(2027)).thenReturn(Optional.of(ano));
            var primeiro = periodo(2027, 1, "1º Bimestre", LocalDate.of(2027, 2, 1), LocalDate.of(2027, 4, 30));
            primeiro.setId(10L);
            var terceiro = periodo(2027, 3, "3º Bimestre", LocalDate.of(2027, 7, 16), LocalDate.of(2027, 9, 30));
            terceiro.setId(30L);
            when(periodoLetivoRepository.findByAnoLetivoOrderBySequenciaAsc(2027))
                    .thenReturn(List.of(primeiro, terceiro));

            service.salvarPeriodos(2027, new PeriodosLetivosRequest(List.of(
                    new Periodo("1º Semestre", LocalDate.of(2027, 2, 3), LocalDate.of(2027, 7, 1)),
                    new Periodo("2º Semestre", LocalDate.of(2027, 8, 1), LocalDate.of(2027, 12, 15)))));

            verify(periodoLetivoRepository).deleteAll(List.of(terceiro));
            verify(periodoLetivoRepository).save(primeiro);
            assertThat(primeiro.getId()).isEqualTo(10L);
            assertThat(primeiro.getNome()).isEqualTo("1º Semestre");
            assertThat(ano.getDataInicio()).isEqualTo(LocalDate.of(2027, 2, 3));
            assertThat(ano.getDataFim()).isEqualTo(LocalDate.of(2027, 12, 15));
        }
    }

    private static AnoLetivo ano(int ano, StatusAnoLetivo status) {
        var anoLetivo = new AnoLetivo();
        anoLetivo.setAno(ano);
        anoLetivo.setStatus(status);
        anoLetivo.setDataInicio(LocalDate.of(ano, 2, 1));
        anoLetivo.setDataFim(LocalDate.of(ano, 12, 20));
        return anoLetivo;
    }

    private static PeriodoLetivo periodo(int ano, int sequencia, String nome, LocalDate inicio, LocalDate fim) {
        var periodo = new PeriodoLetivo();
        periodo.setAnoLetivo(ano);
        periodo.setSequencia(sequencia);
        periodo.setNome(nome);
        periodo.setDataInicio(inicio);
        periodo.setDataFim(fim);
        return periodo;
    }
}
