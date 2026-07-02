package br.com.brain.boletim;

import br.com.brain.aluno.Aluno;
import br.com.brain.boletim.dto.AlunoBoletimDto;
import br.com.brain.boletim.dto.BoletimDto;
import br.com.brain.boletim.dto.DisciplinaBoletimDto;
import br.com.brain.boletim.dto.EscalaDto;
import br.com.brain.boletim.dto.NotaPeriodoDto;
import br.com.brain.boletim.dto.PeriodoBoletimDto;
import br.com.brain.boletim.dto.ResumoBoletimDto;
import br.com.brain.chamada.ChamadaRepository;
import br.com.brain.configuracaoAcademica.ConfiguracaoBoletim;
import br.com.brain.configuracaoAcademica.ConfiguracaoAcademicaService;
import br.com.brain.configuracaoAcademica.EscalaAvaliacao;
import br.com.brain.configuracaoAcademica.PeriodoLetivo;
import br.com.brain.disciplina.Disciplina;
import br.com.brain.disciplina.DisciplinaRepository;
import br.com.brain.enums.TipoAvaliacao;
import br.com.brain.exception.ErrosSistema;
import br.com.brain.notas.Notas;
import br.com.brain.notas.NotasRepository;
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
 * Monta o boletim do aluno agregando as notas ({@link NotasRepository}) e a
 * frequência ({@link ChamadaRepository}) por período, aplicando a escala e os
 * períodos definidos em {@link ConfiguracaoAcademicaService}. Reaproveita os
 * mesmos repositórios usados em "Minhas Turmas", sem duplicar suas estruturas.
 */
@Service
@RequiredArgsConstructor
public class BoletimService {

    private static final String APROVADO = "APROVADO";
    private static final String REPROVADO = "REPROVADO";
    private static final String EM_ANDAMENTO = "EM_ANDAMENTO";

    private final ConfiguracaoAcademicaService configuracaoService;
    private final DisciplinaRepository disciplinaRepository;
    private final NotasRepository notasRepository;
    private final ChamadaRepository chamadaRepository;

    @Transactional(readOnly = true)
    public BoletimDto gerarBoletim(Aluno aluno) {
        Turma turma = aluno.getTurma();
        if (turma == null || turma.getSerie() == null) {
            throw ErrosSistema.OperacaoInvalidaException.com("Aluno não está vinculado a uma turma/série.");
        }

        int anoLetivo = turma.getAnoLetivo();
        ConfiguracaoBoletim config = configuracaoService.obterOuPadrao(anoLetivo);
        EscalaAvaliacao escala = config.escala();
        List<PeriodoLetivo> periodos = config.periodos();
        LocalDate hoje = LocalDate.now();

        var disciplinas = disciplinaRepository.findBySerieIdOrderByNomeAsc(turma.getSerie().getId());
        var disciplinasDto = disciplinas.stream()
                .map(disciplina -> montarDisciplina(aluno.getId(), disciplina, periodos, escala))
                .toList();

        var periodosDto = periodos.stream()
                .map(p -> new PeriodoBoletimDto(p.getId(), p.getNome(), p.getSequencia(), p.contem(hoje)))
                .toList();

        return new BoletimDto(
                anoLetivo,
                escala.getValorAprovacao(),
                new EscalaDto(escala),
                periodosDto,
                montarAluno(aluno, turma),
                montarResumo(disciplinasDto, escala),
                disciplinasDto);
    }

    private DisciplinaBoletimDto montarDisciplina(Long alunoId, Disciplina disciplina,
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
        Integer frequencia = calcularFrequencia(alunoId, disciplina.getId());

        return new DisciplinaBoletimDto(
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

    private ResumoBoletimDto montarResumo(List<DisciplinaBoletimDto> disciplinas, EscalaAvaliacao escala) {
        var finais = disciplinas.stream().map(DisciplinaBoletimDto::notaFinal).filter(Objects::nonNull).toList();
        BigDecimal mediaGeral = finais.isEmpty() ? null : media(finais, escala);

        var frequencias = disciplinas.stream().map(DisciplinaBoletimDto::frequencia).filter(Objects::nonNull).toList();
        Integer frequenciaGeral = mediaInteiros(frequencias);

        long emRecuperacao = disciplinas.stream()
                .filter(d -> d.notaAnual() != null && d.notaAnual().compareTo(escala.getValorAprovacao()) < 0)
                .count();

        return new ResumoBoletimDto(mediaGeral, frequenciaGeral, emRecuperacao, situacaoGeral(disciplinas));
    }

    private AlunoBoletimDto montarAluno(Aluno aluno, Turma turma) {
        var serie = turma.getSerie();
        var unidade = turma.getUnidade();
        return new AlunoBoletimDto(
                aluno.getId(),
                aluno.getDadosPessoais().getNome(),
                serie != null ? serie.getNome() : null,
                turma.getNome(),
                unidade != null ? unidade.getNome() : null);
    }

    /** Frequência geral da disciplina no ano: (total - faltas) / total * 100. */
    private Integer calcularFrequencia(Long alunoId, Long disciplinaId) {
        Integer total = chamadaRepository.countTotalByAlunoAndDisciplina(alunoId, disciplinaId);
        if (total == null || total == 0) {
            return null;
        }
        int faltas = zeroSeNulo(chamadaRepository.countFaltasByAlunoAndDisciplina(alunoId, disciplinaId));
        return (int) Math.round((total - faltas) * 100.0 / total);
    }

    private String situacaoDisciplina(BigDecimal notaFinal, EscalaAvaliacao escala) {
        if (notaFinal == null) {
            return EM_ANDAMENTO;
        }
        return notaFinal.compareTo(escala.getValorAprovacao()) >= 0 ? APROVADO : REPROVADO;
    }

    private String situacaoGeral(List<DisciplinaBoletimDto> disciplinas) {
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

    private BigDecimal arredondar(BigDecimal valor, EscalaAvaliacao escala) {
        return valor.setScale(escala.getCasasDecimais(), RoundingMode.HALF_UP);
    }

    private Integer mediaInteiros(List<Integer> valores) {
        if (valores.isEmpty()) {
            return null;
        }
        return (int) Math.round(valores.stream().mapToInt(Integer::intValue).sum() / (double) valores.size());
    }

    private int zeroSeNulo(Integer valor) {
        return valor == null ? 0 : valor;
    }
}
