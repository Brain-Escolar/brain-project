package br.com.brain.configuracaoAcademica;

import br.com.brain.enums.TipoEscala;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Month;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ConfiguracaoAcademicaService {

    private final ConfiguracaoEscolaRepository configuracaoEscolaRepository;
    private final PeriodoLetivoRepository periodoLetivoRepository;

    /**
     * Compõe a configuração usada pelos relatórios: a escala da escola (constante,
     * linha única em {@code configuracoes_escola}) e os períodos do ano letivo.
     * Quando a escola ainda não personalizou, aplica o padrão (escala 0–10 com
     * aprovação 6,0 e 4 bimestres), mantendo os relatórios funcionais desde o início.
     */
    @Transactional(readOnly = true)
    public ConfiguracaoRelatorio obterOuPadrao(int anoLetivo) {
        var escala = configuracaoEscolaRepository.findById(ConfiguracaoEscola.ID_UNICO)
                .map(ConfiguracaoEscola::getEscala)
                .orElseGet(this::escalaPadrao);

        var periodos = periodoLetivoRepository.findByAnoLetivoOrderBySequenciaAsc(anoLetivo);
        if (periodos.isEmpty()) {
            periodos = periodosPadrao(anoLetivo);
        }

        return new ConfiguracaoRelatorio(anoLetivo, escala, periodos);
    }

    private EscalaAvaliacao escalaPadrao() {
        return new EscalaAvaliacao(
                TipoEscala.NUMERIC,
                BigDecimal.ZERO,
                BigDecimal.TEN,
                new BigDecimal("6.0"),
                1,
                "Escala de 0 a 10");
    }

    private List<PeriodoLetivo> periodosPadrao(int anoLetivo) {
        return List.of(
                periodoPadrao(anoLetivo, 1L, "1º Bimestre", 1, LocalDate.of(anoLetivo, Month.FEBRUARY, 1), LocalDate.of(anoLetivo, Month.APRIL, 30)),
                periodoPadrao(anoLetivo, 2L, "2º Bimestre", 2, LocalDate.of(anoLetivo, Month.MAY, 1), LocalDate.of(anoLetivo, Month.JULY, 15)),
                periodoPadrao(anoLetivo, 3L, "3º Bimestre", 3, LocalDate.of(anoLetivo, Month.JULY, 16), LocalDate.of(anoLetivo, Month.SEPTEMBER, 30)),
                periodoPadrao(anoLetivo, 4L, "4º Bimestre", 4, LocalDate.of(anoLetivo, Month.OCTOBER, 1), LocalDate.of(anoLetivo, Month.DECEMBER, 20)));
    }

    private PeriodoLetivo periodoPadrao(int anoLetivo, Long id, String nome, int sequencia,
            LocalDate inicio, LocalDate fim) {
        var periodo = new PeriodoLetivo();
        periodo.setId(id);
        periodo.setAnoLetivo(anoLetivo);
        periodo.setNome(nome);
        periodo.setSequencia(sequencia);
        periodo.setDataInicio(inicio);
        periodo.setDataFim(fim);
        return periodo;
    }
}
