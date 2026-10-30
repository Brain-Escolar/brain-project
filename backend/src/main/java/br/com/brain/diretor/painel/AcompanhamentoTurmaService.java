package br.com.brain.diretor.painel;

import br.com.brain.matricula.MatriculaRepository;
import br.com.brain.aluno.Aluno;
import br.com.brain.anotacao.Anotacao;
import br.com.brain.anotacao.AnotacaoRepository;
import br.com.brain.aula.AulaRepository;
import br.com.brain.chamada.ChamadaRepository;
import br.com.brain.configuracaoAcademica.ConfiguracaoAcademicaService;
import br.com.brain.configuracaoAcademica.EscalaAvaliacao;
import br.com.brain.configuracaoAcademica.PeriodoLetivo;
import br.com.brain.diretor.painel.dto.AcompanhamentoTurmaDto;
import br.com.brain.diretor.painel.dto.AcompanhamentoTurmaDto.AlunoDto;
import br.com.brain.diretor.painel.dto.AcompanhamentoTurmaDto.AnotacaoDto;
import br.com.brain.diretor.painel.dto.AcompanhamentoTurmaDto.CriteriosDto;
import br.com.brain.diretor.painel.dto.AcompanhamentoTurmaDto.DisciplinaDto;
import br.com.brain.diretor.painel.dto.AcompanhamentoTurmaDto.DisciplinaOpcaoDto;
import br.com.brain.diretor.painel.dto.AcompanhamentoTurmaDto.GeralDto;
import br.com.brain.diretor.painel.dto.AcompanhamentoTurmaDto.NotaDisciplinaDto;
import br.com.brain.diretor.painel.dto.AcompanhamentoTurmaDto.ResumoDto;
import br.com.brain.diretor.painel.dto.AcompanhamentoTurmaDto.TurmaDto;
import br.com.brain.diretor.painel.dto.FiltrosAcompanhamentoDto;
import br.com.brain.diretor.painel.dto.FiltrosAcompanhamentoDto.PeriodoFiltroDto;
import br.com.brain.diretor.painel.dto.FiltrosAcompanhamentoDto.TurmaFiltroDto;
import br.com.brain.diretor.projecao.FrequenciaAgregada;
import br.com.brain.diretor.projecao.ProfessorDaDisciplina;
import br.com.brain.disciplina.Disciplina;
import br.com.brain.disciplina.DisciplinaRepository;
import br.com.brain.enums.Anotacoes;
import br.com.brain.enums.TipoAvaliacao;
import br.com.brain.exception.ErrosSistema;
import br.com.brain.notas.Notas;
import br.com.brain.notas.NotasRepository;
import br.com.brain.turma.Turma;
import br.com.brain.turma.TurmaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.TreeSet;
import java.util.function.Predicate;
import java.util.stream.Collectors;

/**
 * Acompanhamento por turma da Direção: notas, faltas, atrasos e anotações de
 * comportamento de cada aluno, num período letivo ou no acumulado do ano.
 *
 * <p>Notas seguem a mesma regra dos relatórios do aluno ({@code RelatoriosService}):
 * a nota de um período é a média das avaliações regulares lançadas nele, e a
 * média da disciplina é a média dos períodos — recuperação fica de fora.
 * Atrasos são as anotações do tipo {@link Anotacoes#ATRASO}; as demais
 * anotações contam como comportamento.
 */
@Service
@RequiredArgsConstructor
public class AcompanhamentoTurmaService {

    /** Frequência mínima legal (LDB, art. 24): abaixo disso o aluno reprova por falta. */
    static final BigDecimal FREQUENCIA_MINIMA = new BigDecimal("75.0");
    /** A partir de quantos atrasos num período o atraso deixa de ser pontual. */
    static final int ATRASOS_POR_PERIODO = 3;
    /** A partir de quantas anotações de comportamento num período o aluno pede conversa. */
    static final int ANOTACOES_POR_PERIODO = 2;
    /** Disciplinas abaixo da média que, mesmo com média geral boa, já pedem atenção. */
    static final int DISCIPLINAS_ABAIXO_ATENCAO = 3;
    private static final int ESCALA_FREQUENCIA = 1;

    private final TurmaRepository turmaRepository;
    private final MatriculaRepository matriculaRepository;
    private final DisciplinaRepository disciplinaRepository;
    private final NotasRepository notasRepository;
    private final ChamadaRepository chamadaRepository;
    private final AnotacaoRepository anotacaoRepository;
    private final AulaRepository aulaRepository;
    private final ConfiguracaoAcademicaService configuracaoService;

    @Transactional(readOnly = true)
    public FiltrosAcompanhamentoDto filtros() {
        var hoje = LocalDate.now();
        int anoLetivo = configuracaoService.anoEmContexto();
        var periodos = configuracaoService.obterOuPadrao(anoLetivo).periodos();
        var corrente = PeriodosLetivos.corrente(periodos, hoje);

        var periodosDto = periodos.stream()
                .map(p -> new PeriodoFiltroDto(p.getSequencia(), p.getNome(),
                        !p.getDataInicio().isAfter(hoje), p.equals(corrente) && p.contem(hoje)))
                .toList();

        var turmasDto = turmaRepository.findDoAnoLetivoComUnidadeESerie(anoLetivo).stream()
                .map(t -> new TurmaFiltroDto(
                        t.getId(),
                        t.getNome(),
                        t.getSerie().getNome(),
                        t.getUnidade().getId(),
                        t.getUnidade().getNome(),
                        t.getTurno() != null ? t.getTurno().getTipo() : null,
                        t.getSala()))
                .toList();

        return new FiltrosAcompanhamentoDto(anoLetivo, periodosDto, turmasDto);
    }

    /**
     * @param periodoSequencia período letivo do recorte; nulo = acumulado dos
     *                         períodos que já começaram.
     * @param disciplinaId     disciplina do recorte; nulo = todas.
     */
    @Transactional(readOnly = true)
    public AcompanhamentoTurmaDto montar(Long turmaId, Integer periodoSequencia, Long disciplinaId) {
        var turma = turmaRepository.findById(turmaId)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Turma", turmaId));
        if (turma.getSerie() == null) {
            throw ErrosSistema.OperacaoInvalidaException.com("Turma sem série vinculada.");
        }

        var config = configuracaoService.obterOuPadrao(turma.getAnoLetivo());
        var escala = config.escala();
        var considerados = periodosDoRecorte(config.periodos(), periodoSequencia);
        var inicio = considerados.get(0).getDataInicio();
        var fim = considerados.get(considerados.size() - 1).getDataFim();

        var disciplinas = disciplinaRepository.findBySerieIdOrderByNomeAsc(turma.getSerie().getId());
        if (disciplinaId != null && disciplinas.stream().noneMatch(d -> d.getId().equals(disciplinaId))) {
            throw ErrosSistema.OperacaoInvalidaException.com("Disciplina não pertence à série da turma.");
        }

        var alunos = matriculaRepository.findAlunosDaTurma(turmaId);
        var idsAlunos = alunos.stream().map(Aluno::getId).collect(Collectors.toSet());

        var notas = new QuadroDeNotas(notasRepository.findComAvaliacaoByTurmaId(turmaId), considerados, escala);
        var frequencia = agregarFrequencia(chamadaRepository.agregarPorAlunoEDisciplina(turmaId, inicio, fim));

        var anotacoesDoPeriodo = anotacaoRepository.findDaTurmaNoPeriodo(turmaId, inicio, fim).stream()
                .filter(a -> a.getAluno() != null && idsAlunos.contains(a.getAluno().getId()))
                .toList();
        var atrasos = anotacoesDoPeriodo.stream().filter(this::ehAtraso).toList();
        var comportamento = anotacoesDoPeriodo.stream().filter(Predicate.not(this::ehAtraso)).toList();

        var criterios = new CriteriosDto(
                escala.getValorAprovacao(), FREQUENCIA_MINIMA, ATRASOS_POR_PERIODO, ANOTACOES_POR_PERIODO,
                considerados.size());

        var alunosDto = alunos.stream()
                .map(aluno -> montarAluno(aluno, disciplinas, disciplinaId, notas, frequencia, atrasos,
                        comportamento, criterios, escala))
                .toList();

        var nomesAlunos = alunos.stream()
                .collect(Collectors.toMap(Aluno::getId, a -> a.getDadosPessoais().getNome()));

        var anotacoesDto = comportamento.stream()
                .filter(a -> disciplinaId == null || disciplinaId.equals(a.getAula().getDisciplina().getId()))
                .map(a -> montarAnotacao(a, nomesAlunos))
                .toList();

        return new AcompanhamentoTurmaDto(
                montarTurma(turma, alunos.size()),
                rotuloPeriodo(considerados, periodoSequencia),
                disciplinaId,
                criterios,
                disciplinas.stream().map(d -> new DisciplinaOpcaoDto(d.getId(), d.getNome())).toList(),
                montarResumo(alunosDto, escala, criterios),
                alunosDto,
                montarDisciplinas(disciplinas, alunos, notas, frequencia, comportamento, turmaId, escala),
                anotacoesDto);
    }

    private List<PeriodoLetivo> periodosDoRecorte(List<PeriodoLetivo> periodos, Integer sequencia) {
        if (sequencia == null) {
            return PeriodosLetivos.iniciados(periodos, LocalDate.now());
        }
        var escolhido = periodos.stream().filter(p -> sequencia.equals(p.getSequencia())).toList();
        if (escolhido.isEmpty()) {
            throw ErrosSistema.OperacaoInvalidaException.com("Período letivo " + sequencia + " não existe.");
        }
        return escolhido;
    }

    private String rotuloPeriodo(List<PeriodoLetivo> considerados, Integer sequencia) {
        if (sequencia != null) {
            return considerados.get(0).getNome();
        }
        var primeiro = considerados.get(0);
        var ultimo = considerados.get(considerados.size() - 1);
        var faixa = primeiro == ultimo ? primeiro.getNome() : primeiro.getNome() + " a " + ultimo.getNome();
        return "Acumulado " + primeiro.getAnoLetivo() + " (" + faixa + ")";
    }

    private AlunoDto montarAluno(Aluno aluno, List<Disciplina> disciplinas, Long disciplinaId,
            QuadroDeNotas notas, Map<ChaveFrequencia, Contagem> frequencia, List<Anotacao> atrasos,
            List<Anotacao> comportamento, CriteriosDto criterios, EscalaAvaliacao escala) {
        var alunoId = aluno.getId();

        List<NotaDisciplinaDto> porDisciplina = new ArrayList<>();
        int faltasGerais = 0;
        int aulasGerais = 0;
        for (Disciplina disciplina : disciplinas) {
            var contagem = frequencia.getOrDefault(new ChaveFrequencia(alunoId, disciplina.getId()), Contagem.ZERO);
            faltasGerais += contagem.faltas();
            aulasGerais += contagem.aulas();
            porDisciplina.add(new NotaDisciplinaDto(disciplina.getId(), disciplina.getNome(),
                    notas.media(alunoId, disciplina.getId()), contagem.faltas(), contagem.aulas()));
        }

        var medias = porDisciplina.stream().map(NotaDisciplinaDto::media).filter(Objects::nonNull).toList();
        var mediaGeral = medias.isEmpty() ? null : media(medias, escala.getCasasDecimais());
        int disciplinasAbaixo = (int) medias.stream()
                .filter(m -> m.compareTo(criterios.mediaMinima()) < 0)
                .count();
        var anotacoesDoAluno = comportamento.stream().filter(a -> alunoId.equals(a.getAluno().getId())).toList();
        var geral = new GeralDto(mediaGeral, disciplinasAbaixo, faltasGerais,
                frequencia(aulasGerais, faltasGerais), anotacoesDoAluno.size());

        var datasAtrasos = atrasos.stream()
                .filter(a -> alunoId.equals(a.getAluno().getId()))
                .map(Anotacao::getDataAnotacao)
                .filter(Objects::nonNull)
                .sorted(Comparator.reverseOrder())
                .toList();

        // Recorte de disciplina: a linha da tabela mostra só aquela matéria.
        BigDecimal mediaRecorte = geral.media();
        int faltasRecorte = geral.faltas();
        BigDecimal frequenciaRecorte = geral.frequencia();
        int anotacoesRecorte = geral.anotacoes();
        if (disciplinaId != null) {
            var nota = porDisciplina.stream().filter(n -> n.disciplinaId().equals(disciplinaId)).findFirst()
                    .orElseThrow();
            mediaRecorte = nota.media();
            faltasRecorte = nota.faltas();
            frequenciaRecorte = frequencia(nota.aulas(), nota.faltas());
            anotacoesRecorte = (int) anotacoesDoAluno.stream()
                    .filter(a -> disciplinaId.equals(a.getAula().getDisciplina().getId()))
                    .count();
        }

        return new AlunoDto(
                alunoId,
                aluno.getDadosPessoais().getNome(),
                aluno.getDadosPessoais().getMatricula(),
                mediaRecorte,
                faltasRecorte,
                frequenciaRecorte,
                anotacoesRecorte,
                geral,
                datasAtrasos.size(),
                datasAtrasos,
                motivosAtencao(geral, datasAtrasos.size(), criterios),
                porDisciplina);
    }

    /** Por que o aluno está "em atenção"; vazio = situação regular. */
    static List<String> motivosAtencao(GeralDto geral, int atrasos, CriteriosDto criterios) {
        List<String> motivos = new ArrayList<>();
        if (geral.media() != null && geral.media().compareTo(criterios.mediaMinima()) < 0) {
            motivos.add("média abaixo de " + formatar(criterios.mediaMinima()));
        } else if (geral.disciplinasAbaixo() >= DISCIPLINAS_ABAIXO_ATENCAO) {
            motivos.add(geral.disciplinasAbaixo() + " disciplinas abaixo da média");
        }
        if (geral.frequencia() != null && geral.frequencia().compareTo(criterios.frequenciaMinima()) < 0) {
            motivos.add("frequência abaixo de " + criterios.frequenciaMinima().stripTrailingZeros().toPlainString()
                    + "%");
        }
        if (atrasos >= criterios.atrasosPorPeriodo() * criterios.periodosConsiderados()) {
            motivos.add(atrasos + " atrasos");
        }
        if (geral.anotacoes() >= criterios.anotacoesPorPeriodo() * criterios.periodosConsiderados()) {
            motivos.add(geral.anotacoes() + " anotações de comportamento");
        }
        return motivos;
    }

    private ResumoDto montarResumo(List<AlunoDto> alunos, EscalaAvaliacao escala, CriteriosDto criterios) {
        var medias = alunos.stream().map(AlunoDto::media).filter(Objects::nonNull).toList();
        var frequencias = alunos.stream().map(AlunoDto::frequencia).filter(Objects::nonNull).toList();
        int limiteAtrasos = criterios.atrasosPorPeriodo() * criterios.periodosConsiderados();
        return new ResumoDto(
                medias.isEmpty() ? null : media(medias, escala.getCasasDecimais()),
                (int) medias.stream().filter(m -> m.compareTo(criterios.mediaMinima()) < 0).count(),
                frequencias.isEmpty() ? null : media(frequencias, ESCALA_FREQUENCIA),
                (int) frequencias.stream().filter(f -> f.compareTo(criterios.frequenciaMinima()) < 0).count(),
                alunos.stream().mapToInt(AlunoDto::atrasos).sum(),
                (int) alunos.stream().filter(a -> a.atrasos() >= limiteAtrasos).count(),
                alunos.stream().mapToInt(AlunoDto::anotacoes).sum(),
                (int) alunos.stream().filter(a -> a.anotacoes() > 0).count(),
                (int) alunos.stream().filter(a -> !a.motivosAtencao().isEmpty()).count());
    }

    private List<DisciplinaDto> montarDisciplinas(List<Disciplina> disciplinas, List<Aluno> alunos,
            QuadroDeNotas notas, Map<ChaveFrequencia, Contagem> frequencia, List<Anotacao> comportamento,
            Long turmaId, EscalaAvaliacao escala) {
        Map<Long, Set<String>> professores = new HashMap<>();
        for (ProfessorDaDisciplina p : aulaRepository.findProfessoresPorDisciplinaDaTurma(turmaId)) {
            professores.computeIfAbsent(p.disciplinaId(), id -> new TreeSet<>()).add(p.professor());
        }
        var mediaMinima = escala.getValorAprovacao();

        return disciplinas.stream().map(disciplina -> {
            var id = disciplina.getId();
            List<BigDecimal> medias = new ArrayList<>();
            int faltas = 0;
            int aulas = 0;
            for (Aluno aluno : alunos) {
                var media = notas.media(aluno.getId(), id);
                if (media != null) {
                    medias.add(media);
                }
                var contagem = frequencia.getOrDefault(new ChaveFrequencia(aluno.getId(), id), Contagem.ZERO);
                faltas += contagem.faltas();
                aulas += contagem.aulas();
            }
            int anotacoes = (int) comportamento.stream()
                    .filter(a -> id.equals(a.getAula().getDisciplina().getId()))
                    .count();
            var nomesProfessores = professores.getOrDefault(id, Set.of());
            return new DisciplinaDto(
                    id,
                    disciplina.getNome(),
                    nomesProfessores.isEmpty() ? null : String.join(", ", nomesProfessores),
                    medias.isEmpty() ? null : media(medias, escala.getCasasDecimais()),
                    (int) medias.stream().filter(m -> m.compareTo(mediaMinima) < 0).count(),
                    medias.size(),
                    faltas,
                    frequencia(aulas, faltas),
                    anotacoes);
        }).toList();
    }

    private AnotacaoDto montarAnotacao(Anotacao anotacao, Map<Long, String> nomesAlunos) {
        var aula = anotacao.getAula();
        var professor = aula.getProfessor();
        var tipo = anotacao.getTipoAnotacao();
        return new AnotacaoDto(
                anotacao.getId(),
                anotacao.getAluno().getId(),
                nomesAlunos.get(anotacao.getAluno().getId()),
                anotacao.getDataAnotacao(),
                tipo.name(),
                tipo.getDescricao(),
                aula.getDisciplina().getId(),
                aula.getDisciplina().getNome(),
                professor != null && professor.getDadosPessoais() != null
                        ? professor.getDadosPessoais().getNome()
                        : null,
                anotacao.getObservacao());
    }

    private TurmaDto montarTurma(Turma turma, int totalAlunos) {
        return new TurmaDto(
                turma.getId(),
                turma.getNome(),
                turma.getSerie().getNome(),
                turma.getUnidade() != null ? turma.getUnidade().getNome() : null,
                turma.getTurno() != null ? turma.getTurno().getTipo() : null,
                turma.getSala(),
                totalAlunos);
    }

    private boolean ehAtraso(Anotacao anotacao) {
        return anotacao.getTipoAnotacao() == Anotacoes.ATRASO;
    }

    private Map<ChaveFrequencia, Contagem> agregarFrequencia(List<FrequenciaAgregada> linhas) {
        Map<ChaveFrequencia, Contagem> mapa = new HashMap<>();
        for (FrequenciaAgregada linha : linhas) {
            mapa.put(new ChaveFrequencia(linha.alunoId(), linha.disciplinaId()),
                    new Contagem(paraInt(linha.aulas()), paraInt(linha.faltas())));
        }
        return mapa;
    }

    /** (aulas - faltas) / aulas * 100; nulo quando não há chamada registrada. */
    static BigDecimal frequencia(int aulas, int faltas) {
        if (aulas == 0) {
            return null;
        }
        return BigDecimal.valueOf((aulas - faltas) * 100.0 / aulas).setScale(ESCALA_FREQUENCIA, RoundingMode.HALF_UP);
    }

    private static BigDecimal media(List<BigDecimal> valores, int casas) {
        var soma = valores.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        return soma.divide(BigDecimal.valueOf(valores.size()), casas, RoundingMode.HALF_UP);
    }

    private static String formatar(BigDecimal valor) {
        return valor.setScale(1, RoundingMode.HALF_UP).toPlainString().replace('.', ',');
    }

    private static int paraInt(Long valor) {
        return valor == null ? 0 : valor.intValue();
    }

    private record ChaveFrequencia(Long alunoId, Long disciplinaId) {
    }

    private record Contagem(int aulas, int faltas) {
        static final Contagem ZERO = new Contagem(0, 0);
    }

    /**
     * Notas regulares da turma organizadas por aluno, disciplina e período —
     * a média da disciplina é a média das notas de cada período do recorte.
     */
    static final class QuadroDeNotas {

        private final Map<Long, Map<Long, Map<PeriodoLetivo, List<BigDecimal>>>> notas = new HashMap<>();
        private final int casas;

        QuadroDeNotas(List<Notas> lancadas, List<PeriodoLetivo> considerados, EscalaAvaliacao escala) {
            this.casas = escala.getCasasDecimais();
            for (Notas nota : lancadas) {
                var avaliacao = nota.getAvaliacaoTurma().getAvaliacao();
                if (avaliacao.getTipo() == TipoAvaliacao.RECUPERACAO || nota.getPontuacao() == null
                        || nota.getAluno() == null || avaliacao.getDisciplina() == null) {
                    continue;
                }
                var periodo = considerados.stream()
                        .filter(p -> p.contem(nota.getPeriodoReferencia()))
                        .findFirst();
                if (periodo.isEmpty()) {
                    continue;
                }
                notas.computeIfAbsent(nota.getAluno().getId(), id -> new HashMap<>())
                        .computeIfAbsent(avaliacao.getDisciplina().getId(), id -> new LinkedHashMap<>())
                        .computeIfAbsent(periodo.get(), p -> new ArrayList<>())
                        .add(nota.getPontuacao());
            }
        }

        /** Média do aluno na disciplina no recorte; nulo quando não há nota lançada. */
        BigDecimal media(Long alunoId, Long disciplinaId) {
            var porPeriodo = notas.getOrDefault(alunoId, Map.of()).get(disciplinaId);
            if (porPeriodo == null || porPeriodo.isEmpty()) {
                return null;
            }
            var mediasDosPeriodos = porPeriodo.values().stream().map(v -> AcompanhamentoTurmaService.media(v, casas))
                    .toList();
            return AcompanhamentoTurmaService.media(mediasDosPeriodos, casas);
        }
    }
}
