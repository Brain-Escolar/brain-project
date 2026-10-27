package br.com.brain.diretor.painel;

import br.com.brain.aluno.AlunoRepository;
import br.com.brain.autenticacao.DadosAutenticacao;
import br.com.brain.chamada.ChamadaRepository;
import br.com.brain.comunicado.ComunicadoService;
import br.com.brain.configuracaoAcademica.ConfiguracaoAcademicaService;
import br.com.brain.configuracaoAcademica.EscalaAvaliacao;
import br.com.brain.configuracaoAcademica.PeriodoLetivo;
import br.com.brain.diretor.painel.dto.DesempenhoSerieDto;
import br.com.brain.diretor.painel.dto.FrequenciaMensalDto;
import br.com.brain.diretor.painel.dto.IndicadoresDiretorDto;
import br.com.brain.diretor.painel.dto.InicioDiretorDto;
import br.com.brain.diretor.projecao.FrequenciaMensal;
import br.com.brain.disciplina.DisciplinaRepository;
import br.com.brain.enums.TipoAvaliacao;
import br.com.brain.notas.NotasRepository;
import br.com.brain.professor.ProfessorRepository;
import br.com.brain.serie.SerieRepository;
import br.com.brain.turma.TurmaRepository;
import br.com.brain.unidade.UnidadeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

/**
 * Monta o painel inicial da Direção a partir dos domínios que já existem —
 * alunos, professores, turmas, notas, chamadas e comunicados. A Direção
 * enxerga a escola (tenant) inteira, todas as unidades.
 */
@Service
@RequiredArgsConstructor
public class InicioDiretorService {

    /** Quantos comunicados aparecem no resumo da tela inicial. */
    private static final int COMUNICADOS_NO_INICIO = 4;
    /** Quantos meses o gráfico de frequência cobre, contando o atual. */
    private static final int MESES_DE_FREQUENCIA = 6;
    private static final int ESCALA_FREQUENCIA = 1;

    private final AlunoRepository alunoRepository;
    private final ProfessorRepository professorRepository;
    private final UnidadeRepository unidadeRepository;
    private final TurmaRepository turmaRepository;
    private final SerieRepository serieRepository;
    private final DisciplinaRepository disciplinaRepository;
    private final NotasRepository notasRepository;
    private final ChamadaRepository chamadaRepository;
    private final ConfiguracaoAcademicaService configuracaoService;
    private final ComunicadoService comunicadoService;

    @Transactional(readOnly = true)
    public InicioDiretorDto montarInicio(DadosAutenticacao usuario) {
        var hoje = LocalDate.now();
        int anoLetivo = configuracaoService.anoEmContexto();
        var config = configuracaoService.obterOuPadrao(anoLetivo);
        var escala = config.escala();
        var atual = PeriodosLetivos.corrente(config.periodos(), hoje);
        var anterior = PeriodosLetivos.anterior(config.periodos(), atual);

        var comunicados = comunicadoService.listar(
                PageRequest.of(0, COMUNICADOS_NO_INICIO, Sort.by(Sort.Direction.DESC, "data")), usuario)
                .getContent();

        return new InicioDiretorDto(
                montarIndicadores(anoLetivo, atual, anterior, escala),
                montarDesempenhoPorSerie(atual, escala),
                montarFrequenciaMensal(hoje),
                comunicados);
    }

    private IndicadoresDiretorDto montarIndicadores(int anoLetivo, PeriodoLetivo atual, PeriodoLetivo anterior,
            EscalaAvaliacao escala) {
        return new IndicadoresDiretorDto(
                alunoRepository.countByMatriculadoTrue(),
                professorRepository.countByAtivoTrue(),
                unidadeRepository.count(),
                turmaRepository.countByAnoLetivo(anoLetivo),
                serieRepository.count(),
                disciplinaRepository.count(),
                atual.getNome(),
                anterior != null ? anterior.getNome() : null,
                frequenciaEntre(atual.getDataInicio(), atual.getDataFim()),
                anterior != null ? frequenciaEntre(anterior.getDataInicio(), anterior.getDataFim()) : null,
                mediaEntre(atual.getDataInicio(), atual.getDataFim(), escala),
                anterior != null ? mediaEntre(anterior.getDataInicio(), anterior.getDataFim(), escala) : null,
                escala.getValorAprovacao(),
                escala.getValorMaximo());
    }

    private List<DesempenhoSerieDto> montarDesempenhoPorSerie(PeriodoLetivo atual, EscalaAvaliacao escala) {
        return notasRepository
                .mediaPorSerie(atual.getDataInicio(), atual.getDataFim(), TipoAvaliacao.RECUPERACAO)
                .stream()
                .map(m -> new DesempenhoSerieDto(m.serieId(), m.serie(), arredondar(m.media(), escala)))
                .toList();
    }

    /** Últimos meses até o atual; mês sem chamada registrada fica de fora. */
    private List<FrequenciaMensalDto> montarFrequenciaMensal(LocalDate hoje) {
        var inicio = hoje.withDayOfMonth(1).minusMonths(MESES_DE_FREQUENCIA - 1L);
        return chamadaRepository.frequenciaMensal(inicio, hoje).stream()
                .filter(f -> f.chamadas() != null && f.chamadas() > 0)
                .map(f -> new FrequenciaMensalDto(f.ano(), f.mes(), percentual(f.presencas(), f.chamadas())))
                .toList();
    }

    private BigDecimal frequenciaEntre(LocalDate inicio, LocalDate fim) {
        long chamadas = 0;
        long presencas = 0;
        for (FrequenciaMensal f : chamadaRepository.frequenciaMensal(inicio, fim)) {
            chamadas += f.chamadas() == null ? 0 : f.chamadas();
            presencas += f.presencas() == null ? 0 : f.presencas();
        }
        return chamadas == 0 ? null : percentual(presencas, chamadas);
    }

    private BigDecimal mediaEntre(LocalDate inicio, LocalDate fim, EscalaAvaliacao escala) {
        return arredondar(notasRepository.mediaGeral(inicio, fim, TipoAvaliacao.RECUPERACAO), escala);
    }

    private BigDecimal percentual(Long parte, Long total) {
        return BigDecimal.valueOf((parte == null ? 0 : parte) * 100.0 / total)
                .setScale(ESCALA_FREQUENCIA, RoundingMode.HALF_UP);
    }

    private BigDecimal arredondar(Double valor, EscalaAvaliacao escala) {
        return valor == null ? null
                : BigDecimal.valueOf(valor).setScale(escala.getCasasDecimais(), RoundingMode.HALF_UP);
    }
}
