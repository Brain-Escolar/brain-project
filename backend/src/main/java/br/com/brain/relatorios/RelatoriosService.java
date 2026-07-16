package br.com.brain.relatorios;

import br.com.brain.aluno.Aluno;
import br.com.brain.chamada.ChamadaRepository;
import br.com.brain.configuracaoAcademica.ConfiguracaoRelatorio;
import br.com.brain.configuracaoAcademica.ConfiguracaoAcademicaService;
import br.com.brain.configuracaoAcademica.EscalaAvaliacao;
import br.com.brain.configuracaoAcademica.PeriodoLetivo;
import br.com.brain.disciplina.Disciplina;
import br.com.brain.disciplina.DisciplinaRepository;
import br.com.brain.enums.TipoAvaliacao;
import br.com.brain.exception.ErrosSistema;
import br.com.brain.notas.Notas;
import br.com.brain.notas.NotasRepository;
import br.com.brain.relatorios.dto.AlunoRelatorioDto;
import br.com.brain.relatorios.dto.DisciplinaRelatorioDto;
import br.com.brain.relatorios.dto.EscalaDto;
import br.com.brain.relatorios.dto.NotaPeriodoDto;
import br.com.brain.relatorios.dto.PeriodoRelatorioDto;
import br.com.brain.relatorios.dto.RelatorioDto;
import br.com.brain.relatorios.dto.ResumoRelatorioDto;
import br.com.brain.turma.Turma;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

/**
 * Monta os relatórios acadêmicos do aluno (notas e frequência) agregando as
 * notas ({@link NotasRepository}) e a frequência ({@link ChamadaRepository}) por
 * período, aplicando a escala e os períodos definidos em
 * {@link ConfiguracaoAcademicaService}. Reaproveita os mesmos repositórios usados
 * em "Minhas Turmas", sem duplicar suas estruturas.
 */
@Service
@RequiredArgsConstructor
public class RelatoriosService {

    private static final String APROVADO = "APROVADO";
    private static final String REPROVADO = "REPROVADO";
    private static final String EM_ANDAMENTO = "EM_ANDAMENTO";

    /** Frequência mínima (%) para a disciplina não entrar em alerta. */
    private static final BigDecimal FREQUENCIA_MINIMA = new BigDecimal("95.0");
    /** Percentual legal máximo de faltas sobre o total de aulas. */
    private static final int PERCENTUAL_LIMITE_FALTAS = 25;
    /** Limite de faltas por disciplina no ano letivo (25% das aulas). */
    private static final int LIMITE_FALTAS = 40;
    private static final int ESCALA_FREQUENCIA = 1;

    private final ConfiguracaoAcademicaService configuracaoService;
    private final DisciplinaRepository disciplinaRepository;
    private final NotasRepository notasRepository;
    private final ChamadaRepository chamadaRepository;

    @Transactional(readOnly = true)
    public RelatorioDto gerarRelatorio(Aluno aluno) {
        Turma turma = aluno.getTurma();
        if (turma == null || turma.getSerie() == null) {
            throw ErrosSistema.OperacaoInvalidaException.com("Aluno não está vinculado a uma turma/série.");
        }

        int anoLetivo = turma.getAnoLetivo();
        ConfiguracaoRelatorio config = configuracaoService.obterOuPadrao(anoLetivo);
        EscalaAvaliacao escala = config.escala();
        List<PeriodoLetivo> periodos = config.periodos();
        LocalDate hoje = LocalDate.now();

        var disciplinas = disciplinaRepository.findBySerieIdOrderByNomeAsc(turma.getSerie().getId());
        var disciplinasDto = disciplinas.stream()
                .map(disciplina -> montarDisciplina(aluno.getId(), disciplina, periodos, escala))
                .toList();

        var periodosDto = periodos.stream()
                .map(p -> new PeriodoRelatorioDto(p.getId(), p.getNome(), p.getSequencia(), p.contem(hoje)))
                .toList();

        return new RelatorioDto(
                anoLetivo,
                escala.getValorAprovacao(),
                FREQUENCIA_MINIMA,
                LIMITE_FALTAS,
                PERCENTUAL_LIMITE_FALTAS,
                new EscalaDto(escala),
                periodosDto,
                montarAluno(aluno, turma),
                montarResumo(disciplinasDto, escala),
                disciplinasDto);
    }

    private DisciplinaRelatorioDto montarDisciplina(Long alunoId, Disciplina disciplina,
            List<PeriodoLetivo> periodos, EscalaAvaliacao escala) {
        var notas = notasRepository.findByAlunoIdAndAvaliacaoTurmaAvaliacaoDisciplinaId(alunoId, disciplina.getId());

        var regulares = notas.stream().filter(n -> tipo(n) != TipoAvaliacao.RECUPERACAO).toList();
        var recuperacoes = notas.stream().filter(n -> tipo(n) == TipoAvaliacao.RECUPERACAO).toList();

        List<NotaPeriodoDto> notasPorPeriodo = new ArrayList<>();
        List<BigDecimal> mediasDosPeriodos = new ArrayList<>();
        int totalFaltas = 0;

        for (PeriodoLetivo periodo : periodos) {
            var pontuacoes = regulares.stream()
                    .filter(n -> periodo.contem(n.getPeriodoReferencia()))
                    .map(Notas::getPontuacao)
                    .toList();
            BigDecimal notaPeriodo = pontuacoes.isEmpty() ? null : media(pontuacoes, escala);
            if (notaPeriodo != null) {
                mediasDosPeriodos.add(notaPeriodo);
            }

            Integer faltas = zeroSeNulo(chamadaRepository.countFaltasByAlunoAndDisciplinaAndPeriodo(
                    alunoId, disciplina.getId(), periodo.getDataInicio(), periodo.getDataFim()));
            totalFaltas += faltas;

            notasPorPeriodo.add(new NotaPeriodoDto(periodo.getId(), periodo.getSequencia(), notaPeriodo, faltas));
        }

        BigDecimal notaAnual = mediasDosPeriodos.isEmpty() ? null : media(mediasDosPeriodos, escala);
        BigDecimal recuperacao = recuperacoes.stream()
                .map(Notas::getPontuacao)
                .filter(Objects::nonNull)
                .max(Comparator.naturalOrder())
                .map(v -> arredondar(v, escala))
                .orElse(null);

        BigDecimal notaFinal = notaAnual;
        if (notaAnual != null && recuperacao != null) {
            notaFinal = notaAnual.max(recuperacao);
        }

        String situacao = situacaoDisciplina(notaFinal, escala);
        BigDecimal frequencia = calcularFrequencia(alunoId, disciplina.getId());

        return new DisciplinaRelatorioDto(
                disciplina.getId(),
                disciplina.getNome(),
                notasPorPeriodo,
                notaAnual,
                recuperacao,
                notaFinal,
                totalFaltas,
                frequencia,
                situacao);
    }

    private ResumoRelatorioDto montarResumo(List<DisciplinaRelatorioDto> disciplinas, EscalaAvaliacao escala) {
        var finais = disciplinas.stream().map(DisciplinaRelatorioDto::notaFinal).filter(Objects::nonNull).toList();
        BigDecimal mediaGeral = finais.isEmpty() ? null : media(finais, escala);

        var frequencias = disciplinas.stream().map(DisciplinaRelatorioDto::frequencia).filter(Objects::nonNull).toList();
        BigDecimal frequenciaGeral = frequencias.isEmpty() ? null : mediaFrequencia(frequencias);

        long emRecuperacao = disciplinas.stream()
                .filter(d -> d.notaAnual() != null && d.notaAnual().compareTo(escala.getValorAprovacao()) < 0)
                .count();

        long disciplinasAprovadas = disciplinas.stream().filter(d -> APROVADO.equals(d.situacao())).count();

        int totalFaltas = disciplinas.stream().mapToInt(d -> zeroSeNulo(d.totalFaltas())).sum();

        long emAlerta = disciplinas.stream()
                .filter(d -> d.frequencia() != null && d.frequencia().compareTo(FREQUENCIA_MINIMA) < 0)
                .count();

        return new ResumoRelatorioDto(
                mediaGeral,
                frequenciaGeral,
                emRecuperacao,
                disciplinasAprovadas,
                disciplinas.size(),
                totalFaltas,
                emAlerta,
                situacaoGeral(disciplinas));
    }

    private AlunoRelatorioDto montarAluno(Aluno aluno, Turma turma) {
        var serie = turma.getSerie();
        var unidade = turma.getUnidade();
        return new AlunoRelatorioDto(
                aluno.getId(),
                aluno.getDadosPessoais().getNome(),
                serie != null ? serie.getNome() : null,
                turma.getNome(),
                unidade != null ? unidade.getNome() : null);
    }

    /** Frequência geral da disciplina no ano: (total - faltas) / total * 100. */
    private BigDecimal calcularFrequencia(Long alunoId, Long disciplinaId) {
        Integer total = chamadaRepository.countTotalByAlunoAndDisciplina(alunoId, disciplinaId);
        if (total == null || total == 0) {
            return null;
        }
        int faltas = zeroSeNulo(chamadaRepository.countFaltasByAlunoAndDisciplina(alunoId, disciplinaId));
        return BigDecimal.valueOf((total - faltas) * 100.0 / total).setScale(ESCALA_FREQUENCIA, RoundingMode.HALF_UP);
    }

    private String situacaoDisciplina(BigDecimal notaFinal, EscalaAvaliacao escala) {
        if (notaFinal == null) {
            return EM_ANDAMENTO;
        }
        return notaFinal.compareTo(escala.getValorAprovacao()) >= 0 ? APROVADO : REPROVADO;
    }

    private String situacaoGeral(List<DisciplinaRelatorioDto> disciplinas) {
        boolean algumReprovado = disciplinas.stream().anyMatch(d -> REPROVADO.equals(d.situacao()));
        if (algumReprovado) {
            return REPROVADO;
        }
        boolean algumPendente = disciplinas.stream().anyMatch(d -> EM_ANDAMENTO.equals(d.situacao()));
        if (algumPendente || disciplinas.isEmpty()) {
            return EM_ANDAMENTO;
        }
        return APROVADO;
    }

    private TipoAvaliacao tipo(Notas nota) {
        return nota.getAvaliacaoTurma().getAvaliacao().getTipo();
    }

    private BigDecimal media(List<BigDecimal> valores, EscalaAvaliacao escala) {
        var soma = valores.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        return soma.divide(BigDecimal.valueOf(valores.size()), escala.getCasasDecimais(), RoundingMode.HALF_UP);
    }

    private BigDecimal mediaFrequencia(List<BigDecimal> valores) {
        var soma = valores.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        return soma.divide(BigDecimal.valueOf(valores.size()), ESCALA_FREQUENCIA, RoundingMode.HALF_UP);
    }

    private BigDecimal arredondar(BigDecimal valor, EscalaAvaliacao escala) {
        return valor.setScale(escala.getCasasDecimais(), RoundingMode.HALF_UP);
    }

    private int zeroSeNulo(Integer valor) {
        return valor == null ? 0 : valor;
    }
}
