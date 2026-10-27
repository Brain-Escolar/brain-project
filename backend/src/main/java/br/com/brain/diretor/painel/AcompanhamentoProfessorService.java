package br.com.brain.diretor.painel;

import br.com.brain.alerta.AlertaService;
import br.com.brain.aluno.AlunoRepository;
import br.com.brain.anotacao.Anotacao;
import br.com.brain.anotacao.AnotacaoRepository;
import br.com.brain.aula.Aula;
import br.com.brain.aula.AulaRepository;
import br.com.brain.avaliacao.AvaliacaoTurma;
import br.com.brain.avaliacao.AvaliacaoTurmaRepository;
import br.com.brain.chamada.ChamadaRepository;
import br.com.brain.configuracaoAcademica.ConfiguracaoAcademicaService;
import br.com.brain.configuracaoAcademica.EscalaAvaliacao;
import br.com.brain.configuracaoAcademica.PeriodoLetivo;
import br.com.brain.conteudo.ConteudoRepository;
import br.com.brain.diretor.painel.dto.AcompanhamentoProfessorDto;
import br.com.brain.diretor.painel.dto.AcompanhamentoProfessorDto.AnotacaoAulaDto;
import br.com.brain.diretor.painel.dto.AcompanhamentoProfessorDto.AnotacaoDto;
import br.com.brain.diretor.painel.dto.AcompanhamentoProfessorDto.AulaDiarioDto;
import br.com.brain.diretor.painel.dto.AcompanhamentoProfessorDto.AulaPendenteDto;
import br.com.brain.diretor.painel.dto.AcompanhamentoProfessorDto.AvaliacaoDto;
import br.com.brain.diretor.painel.dto.AcompanhamentoProfessorDto.DiaDiarioDto;
import br.com.brain.diretor.painel.dto.AcompanhamentoProfessorDto.ProfessorDto;
import br.com.brain.diretor.painel.dto.AcompanhamentoProfessorDto.SemanaDto;
import br.com.brain.diretor.painel.dto.AcompanhamentoProfessorDto.SituacaoAula;
import br.com.brain.diretor.painel.dto.AcompanhamentoProfessorDto.SituacaoAvaliacao;
import br.com.brain.diretor.painel.dto.AcompanhamentoProfessorDto.TurmaDto;
import br.com.brain.diretor.painel.dto.LembretesEnviadosDto;
import br.com.brain.diretor.painel.dto.ProfessoresDiretorDto;
import br.com.brain.diretor.painel.dto.ProfessoresDiretorDto.DiaDto;
import br.com.brain.diretor.painel.dto.ProfessoresDiretorDto.DiaProfessorDto;
import br.com.brain.diretor.painel.dto.ProfessoresDiretorDto.PeriodoDto;
import br.com.brain.diretor.painel.dto.ProfessoresDiretorDto.ProfessorLinhaDto;
import br.com.brain.diretor.painel.dto.ProfessoresDiretorDto.SituacaoProfessor;
import br.com.brain.diretor.projecao.AlunosPorTurma;
import br.com.brain.diretor.projecao.ConteudoRegistrado;
import br.com.brain.diretor.projecao.Feriado;
import br.com.brain.diretor.projecao.NotasLancadas;
import br.com.brain.diretor.projecao.RegistroChamada;
import br.com.brain.enums.PerfilNome;
import br.com.brain.enums.TipoAvaliacao;
import br.com.brain.enums.TipoEvento;
import br.com.brain.evento.EventoRepository;
import br.com.brain.exception.ErrosSistema;
import br.com.brain.notas.NotasRepository;
import br.com.brain.professor.Professor;
import br.com.brain.professor.ProfessorRepository;
import br.com.brain.turma.Turma;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.TreeSet;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Acompanhamento docente da Direção: diário de classe (conteúdo e chamada de
 * cada aula da grade), lançamento de notas e anotações sobre alunos, no
 * período letivo corrente.
 *
 * <p>A grade ({@link Aula}) é semanal; as aulas "previstas" de um professor
 * são cada dia letivo do período, até hoje, em que ele tem aula na grade —
 * menos os feriados da escola ou da unidade da turma. As regras de situação
 * ficam em {@link DiarioDeClasse}.
 */
@Service
@RequiredArgsConstructor
public class AcompanhamentoProfessorService {

    /** "Hoje" e "agora" são os da escola, não os do servidor. */
    static final ZoneId FUSO_ESCOLA = ZoneId.of("America/Sao_Paulo");
    private static final int ESCALA_FREQUENCIA = 1;
    /** Limite da coluna {@code alertas.conteudo}. */
    private static final int TAMANHO_MAXIMO_ALERTA = 255;
    private static final DateTimeFormatter DIA_MES = DateTimeFormatter.ofPattern("dd/MM");
    private static final Comparator<AulaDoDia> POR_HORARIO = Comparator
            .comparing(AulaDoDia::data)
            .thenComparing(a -> a.aula().getHorario() != null ? a.aula().getHorario().getHorarioInicio() : null,
                    Comparator.nullsLast(Comparator.naturalOrder()));

    private final ProfessorRepository professorRepository;
    private final AulaRepository aulaRepository;
    private final ChamadaRepository chamadaRepository;
    private final ConteudoRepository conteudoRepository;
    private final AnotacaoRepository anotacaoRepository;
    private final AvaliacaoTurmaRepository avaliacaoTurmaRepository;
    private final NotasRepository notasRepository;
    private final AlunoRepository alunoRepository;
    private final EventoRepository eventoRepository;
    private final ConfiguracaoAcademicaService configuracaoService;
    private final AlertaService alertaService;

    @Transactional(readOnly = true)
    public ProfessoresDiretorDto listar() {
        var ctx = contexto();
        var semana = DiarioDeClasse.semanaDe(ctx.hoje());
        var desde = min(ctx.periodo().getDataInicio(), semana.get(0));
        var ateDiario = max(ctx.hoje(), semana.get(semana.size() - 1));
        var acompanhados = acompanharTodos(ctx, desde, ateDiario);

        var linhas = acompanhados.stream().map(a -> montarLinha(a, ctx, semana)).toList();
        var ativos = linhas.stream().filter(l -> l.situacao() != SituacaoProfessor.INATIVO).toList();

        var feriados = acompanhados.isEmpty() ? Map.<LocalDate, List<Feriado>>of() : feriados(desde, ateDiario);
        var dias = semana.stream().map(d -> new DiaDto(d, feriadoGeral(feriados.get(d)))).toList();

        var resumo = new ProfessoresDiretorDto.ResumoDto(
                ativos.size(),
                (int) ativos.stream().filter(l -> l.situacao() == SituacaoProfessor.SEM_GRADE).count(),
                (int) ativos.stream().filter(l -> l.situacao() == SituacaoProfessor.EM_DIA).count(),
                (int) ativos.stream().filter(l -> l.situacao() != SituacaoProfessor.SEM_GRADE).count(),
                ativos.stream().mapToInt(ProfessorLinhaDto::aulasPendentes).sum(),
                ativos.stream().mapToInt(ProfessorLinhaDto::avaliacoesPendentes).sum(),
                (int) ativos.stream().filter(l -> l.situacao() == SituacaoProfessor.PENDENTE).count());

        return new ProfessoresDiretorDto(periodoDto(ctx.periodo()), dias, resumo, linhas);
    }

    /**
     * @param data um dia da semana do diário a mostrar; nulo (ou no futuro) = a semana atual.
     */
    @Transactional(readOnly = true)
    public AcompanhamentoProfessorDto detalhar(Long professorId, LocalDate data) {
        var professor = professorRepository.findById(professorId)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Professor"));
        var ctx = contexto();
        var semana = DiarioDeClasse.semanaDe(data == null || data.isAfter(ctx.hoje()) ? ctx.hoje() : data);
        var desde = min(ctx.periodo().getDataInicio(), semana.get(0));
        var ateDiario = max(ctx.hoje(), semana.get(semana.size() - 1));

        var grade = aulaRepository.findGradeDoProfessor(ctx.anoLetivo(), professorId);
        var feriados = grade.isEmpty() ? Map.<LocalDate, List<Feriado>>of() : feriados(desde, ateDiario);
        var diario = montarDiario(grade, ctx, desde, ateDiario, feriados);
        var avaliacoes = acompanharAvaliacoes(avaliacaoTurmaRepository.findDoProfessorAplicadasNoPeriodo(
                ctx.anoLetivo(), professorId, ctx.periodo().getDataInicio(), ctx.periodo().getDataFim()), ctx);
        var acompanhado = new Acompanhado(professor, grade, diario, avaliacoes);

        var idsAulas = grade.stream().map(Aula::getId).toList();
        var anotacoes = idsAulas.isEmpty()
                ? List.<Anotacao>of()
                : anotacaoRepository.findDasAulasNoPeriodo(idsAulas, desde, ctx.hoje());
        var alunosPorTurma = contarAlunos(grade.stream().map(a -> a.getTurma().getId()).collect(Collectors.toSet()));

        var doPeriodo = acompanhado.doPeriodo(ctx);
        var registradas = doPeriodo.stream().filter(a -> a.situacao() == SituacaoAula.REGISTRADA).toList();
        var resumo = new AcompanhamentoProfessorDto.ResumoDto(
                acompanhado.previstas(ctx),
                registradas.size(),
                acompanhado.aulasPendentes(ctx).size(),
                frequencia(registradas),
                acompanhado.avaliacoesAplicadas(),
                acompanhado.avaliacoesLancadas(),
                acompanhado.avaliacoesAtrasadas().size(),
                acompanhado.ultimoRegistro());

        var pendentes = acompanhado.aulasPendentes(ctx).stream()
                .sorted(POR_HORARIO.reversed())
                .map(a -> new AulaPendenteDto(a.data(), a.aula().getTurma().getNome(), nomeSerie(a.aula().getTurma()),
                        a.aula().getDisciplina().getNome(), nomeHorario(a.aula())))
                .toList();

        var dto = new ProfessorDto(
                professor.getId(),
                professor.getDadosPessoais().getNome(),
                professor.getDadosPessoais().getEmail(),
                acompanhado.disciplinas(),
                distintos(grade.stream().map(a -> a.getTurma().getTurno() != null ? a.getTurma().getTurno().getTipo() : null)),
                distintos(grade.stream().map(a -> a.getTurma().getUnidade() != null ? a.getTurma().getUnidade().getNome() : null)),
                Boolean.TRUE.equals(professor.getAtivo()),
                acompanhado.situacao(ctx));

        return new AcompanhamentoProfessorDto(
                dto,
                periodoDto(ctx.periodo()),
                ctx.escala().getValorAprovacao(),
                resumo,
                pendentes,
                montarTurmas(grade, doPeriodo, avaliacoes, alunosPorTurma, ctx),
                montarSemana(semana, diario, anotacoes, feriados, ctx),
                avaliacoes.stream().map(this::avaliacaoDto).toList(),
                anotacoes.stream().filter(a -> ctx.noPeriodo(a.getDataAnotacao())).map(this::anotacaoDto).toList());
    }

    /**
     * Envia a cada professor um alerta com o resumo das suas pendências no
     * período. Professores sem pendência (ou inativos) são pulados.
     *
     * @param professorIds a quem lembrar; nulo ou vazio = todos.
     */
    @Transactional
    public LembretesEnviadosDto enviarLembretes(Collection<Long> professorIds) {
        var ctx = contexto();
        int enviados = 0;
        for (Acompanhado acompanhado : acompanharTodos(ctx, ctx.periodo().getDataInicio(), ctx.hoje())) {
            var professor = acompanhado.professor();
            if (professorIds != null && !professorIds.isEmpty() && !professorIds.contains(professor.getId())) {
                continue;
            }
            if (acompanhado.situacao(ctx) != SituacaoProfessor.PENDENTE) {
                continue;
            }
            alertaService.notificarPessoa(professor.getDadosPessoais(), PerfilNome.PROFESSOR,
                    "Pendências no diário de classe", textoLembrete(acompanhado, ctx));
            enviados++;
        }
        return new LembretesEnviadosDto(enviados);
    }

    // ─── Montagem ──────────────────────────────────────────────────────────

    /** Professores ativos e os inativos que ainda estão na grade do ano. */
    private List<Acompanhado> acompanharTodos(Contexto ctx, LocalDate desde, LocalDate ate) {
        var grade = aulaRepository.findGradeDoAnoLetivo(ctx.anoLetivo());
        var feriados = grade.isEmpty() ? Map.<LocalDate, List<Feriado>>of() : feriados(desde, ate);
        var diario = montarDiario(grade, ctx, desde, ate, feriados).stream()
                .collect(Collectors.groupingBy(a -> a.aula().getProfessor().getId()));
        var avaliacoes = acompanharAvaliacoes(avaliacaoTurmaRepository.findAplicadasNoPeriodo(
                ctx.anoLetivo(), ctx.periodo().getDataInicio(), ctx.periodo().getDataFim()), ctx).stream()
                .collect(Collectors.groupingBy(a -> a.avaliacaoTurma().getProfessor().getId()));
        var gradePorProfessor = grade.stream().collect(Collectors.groupingBy(a -> a.getProfessor().getId()));

        return professorRepository.findTodosComDadosPessoais().stream()
                .filter(p -> Boolean.TRUE.equals(p.getAtivo()) || gradePorProfessor.containsKey(p.getId()))
                .map(p -> new Acompanhado(p,
                        gradePorProfessor.getOrDefault(p.getId(), List.of()),
                        diario.getOrDefault(p.getId(), List.of()),
                        avaliacoes.getOrDefault(p.getId(), List.of())))
                .toList();
    }

    private ProfessorLinhaDto montarLinha(Acompanhado a, Contexto ctx, List<LocalDate> semana) {
        var porDia = a.diario().stream().collect(Collectors.groupingBy(AulaDoDia::data));
        var dias = semana.stream().map(data -> {
            var aulas = porDia.getOrDefault(data, List.of());
            return new DiaProfessorDto(data, aulas.size(),
                    (int) aulas.stream().filter(x -> x.situacao() == SituacaoAula.REGISTRADA).count(),
                    (int) aulas.stream().filter(x -> x.situacao() == SituacaoAula.PENDENTE).count());
        }).toList();

        return new ProfessorLinhaDto(
                a.professor().getId(),
                a.professor().getDadosPessoais().getNome(),
                a.disciplinas(),
                (int) a.grade().stream().map(x -> x.getTurma().getId()).distinct().count(),
                dias,
                a.previstas(ctx),
                (int) a.doPeriodo(ctx).stream().filter(x -> x.situacao() == SituacaoAula.REGISTRADA).count(),
                a.aulasPendentes(ctx).size(),
                a.avaliacoesAplicadas(),
                a.avaliacoesLancadas(),
                a.avaliacoesAtrasadas().size(),
                a.ultimoRegistro(),
                a.situacao(ctx));
    }

    /**
     * Cada aula da grade em cada dia letivo de {@code desde} até {@code ate}, com o
     * que foi lançado nela. Dias depois de hoje entram como aulas previstas.
     */
    private List<AulaDoDia> montarDiario(List<Aula> grade, Contexto ctx, LocalDate desde, LocalDate ate,
            Map<LocalDate, List<Feriado>> feriados) {
        if (grade.isEmpty() || desde.isAfter(ate)) {
            return List.of();
        }
        var ids = grade.stream().map(Aula::getId).toList();
        Map<ChaveAula, RegistroChamada> chamadas = chamadaRepository
                .registrosDasAulas(ids, desde, ate).stream()
                .collect(Collectors.toMap(r -> new ChaveAula(r.aulaId(), r.data()), Function.identity(), (x, y) -> x));
        Map<ChaveAula, ConteudoRegistrado> conteudos = conteudoRepository
                .registradosNasAulas(ids, desde, ate).stream()
                .collect(Collectors.toMap(c -> new ChaveAula(c.aulaId(), c.data()), Function.identity(), (x, y) -> x));
        var gradePorDia = grade.stream().collect(Collectors.groupingBy(Aula::getDiaSemana));

        List<AulaDoDia> diario = new ArrayList<>();
        for (var data = desde; !data.isAfter(ate); data = data.plusDays(1)) {
            if (!ctx.ehLetivo(data)) {
                continue;
            }
            for (Aula aula : gradePorDia.getOrDefault(data.getDayOfWeek(), List.of())) {
                if (feriadoDaTurma(feriados.get(data), aula.getTurma()) != null) {
                    continue;
                }
                var chave = new ChaveAula(aula.getId(), data);
                var chamada = chamadas.get(chave);
                var conteudo = conteudos.get(chave);
                var termino = aula.getHorario() != null ? aula.getHorario().getHorarioFim() : null;
                diario.add(new AulaDoDia(aula, data, conteudo, chamada,
                        DiarioDeClasse.situacaoAula(chamada != null || conteudo != null, data, termino, ctx.agora())));
            }
        }
        return diario;
    }

    private List<AvaliacaoAcompanhada> acompanharAvaliacoes(List<AvaliacaoTurma> avaliacoes, Contexto ctx) {
        if (avaliacoes.isEmpty()) {
            return List.of();
        }
        Map<Long, NotasLancadas> notas = notasRepository
                .contarLancadas(avaliacoes.stream().map(AvaliacaoTurma::getId).toList()).stream()
                .collect(Collectors.toMap(NotasLancadas::avaliacaoTurmaId, Function.identity()));
        var alunos = contarAlunos(avaliacoes.stream().map(a -> a.getTurma().getId()).collect(Collectors.toSet()));
        int casas = ctx.escala().getCasasDecimais();

        return avaliacoes.stream().map(at -> {
            var lancadas = notas.get(at.getId());
            int quantas = lancadas != null ? lancadas.lancadas().intValue() : 0;
            var media = lancadas != null && lancadas.media() != null
                    ? BigDecimal.valueOf(lancadas.media()).setScale(casas, RoundingMode.HALF_UP)
                    : null;
            int matriculados = alunos.getOrDefault(at.getTurma().getId(), 0);
            var prazo = at.getDataEntregaNotas() != null ? at.getDataEntregaNotas() : ctx.periodo().getDataFim();
            return new AvaliacaoAcompanhada(at, matriculados, quantas, media, prazo,
                    DiarioDeClasse.situacaoAvaliacao(at.getDataAplicacao(), prazo, quantas, matriculados, ctx.hoje()));
        }).toList();
    }

    private List<TurmaDto> montarTurmas(List<Aula> grade, List<AulaDoDia> doPeriodo,
            List<AvaliacaoAcompanhada> avaliacoes, Map<Long, Integer> alunosPorTurma, Contexto ctx) {
        Map<ChaveTurma, Aula> turmas = new LinkedHashMap<>();
        grade.stream()
                .sorted(Comparator.comparing((Aula a) -> nomeSerie(a.getTurma()), Comparator.nullsLast(Comparator.naturalOrder()))
                        .thenComparing(a -> a.getTurma().getNome())
                        .thenComparing(a -> a.getDisciplina().getNome()))
                .forEach(a -> turmas.putIfAbsent(new ChaveTurma(a.getTurma().getId(), a.getDisciplina().getId()), a));
        int casas = ctx.escala().getCasasDecimais();

        return turmas.entrySet().stream().map(e -> {
            var chave = e.getKey();
            var turma = e.getValue().getTurma();
            var aulas = doPeriodo.stream()
                    .filter(a -> chave.equals(new ChaveTurma(a.aula().getTurma().getId(), a.aula().getDisciplina().getId())))
                    .toList();
            var registradas = aulas.stream().filter(a -> a.situacao() == SituacaoAula.REGISTRADA).toList();
            var daTurma = avaliacoes.stream()
                    .filter(a -> chave.turmaId().equals(a.avaliacaoTurma().getTurma().getId()))
                    .filter(a -> {
                        var disciplina = a.avaliacaoTurma().getAvaliacao().getDisciplina();
                        return disciplina == null || chave.disciplinaId().equals(disciplina.getId());
                    })
                    .toList();
            var medias = daTurma.stream()
                    .filter(a -> a.avaliacaoTurma().getAvaliacao().getTipo() != TipoAvaliacao.RECUPERACAO)
                    .map(AvaliacaoAcompanhada::media)
                    .filter(Objects::nonNull)
                    .toList();
            return new TurmaDto(
                    turma.getId(),
                    turma.getNome(),
                    nomeSerie(turma),
                    chave.disciplinaId(),
                    e.getValue().getDisciplina().getNome(),
                    alunosPorTurma.getOrDefault(turma.getId(), 0),
                    (int) aulas.stream().filter(a -> a.situacao() != SituacaoAula.PREVISTA).count(),
                    registradas.size(),
                    frequencia(registradas),
                    medias.isEmpty() ? null : media(medias, casas),
                    (int) daTurma.stream().filter(a -> a.situacao() == SituacaoAvaliacao.LANCADA).count(),
                    daTurma.size());
        }).toList();
    }

    private SemanaDto montarSemana(List<LocalDate> semana, List<AulaDoDia> diario,
            List<Anotacao> anotacoes, Map<LocalDate, List<Feriado>> feriados, Contexto ctx) {
        Map<ChaveAula, List<Anotacao>> anotacoesPorAula = anotacoes.stream()
                .filter(a -> a.getDataAnotacao() != null)
                .collect(Collectors.groupingBy(a -> new ChaveAula(a.getAula().getId(), a.getDataAnotacao())));
        var porDia = diario.stream().collect(Collectors.groupingBy(AulaDoDia::data));

        var dias = semana.stream().map(data -> new DiaDiarioDto(
                data,
                feriadoGeral(feriados.get(data)),
                porDia.getOrDefault(data, List.of()).stream()
                        .sorted(POR_HORARIO)
                        .map(a -> aulaDiarioDto(a, anotacoesPorAula.getOrDefault(new ChaveAula(a.aula().getId(), data), List.of())))
                        .toList()))
                .toList();

        // Antes do primeiro período do ano não há grade; depois da semana atual, nada a acompanhar.
        var segunda = semana.get(0);
        var inicioDoAno = ctx.periodos().get(0).getDataInicio();
        var proxima = segunda.plusDays(7);
        return new SemanaDto(
                segunda,
                semana.get(semana.size() - 1),
                segunda.isAfter(inicioDoAno) ? segunda.minusDays(7) : null,
                !proxima.isAfter(ctx.hoje()) ? proxima : null,
                dias);
    }

    private AulaDiarioDto aulaDiarioDto(AulaDoDia a, List<Anotacao> anotacoes) {
        var aula = a.aula();
        var horario = aula.getHorario();
        var chamada = a.chamada();
        return new AulaDiarioDto(
                aula.getId(),
                aula.getTurma().getId(),
                aula.getTurma().getNome(),
                nomeSerie(aula.getTurma()),
                aula.getDisciplina().getNome(),
                horario != null ? horario.getNome() : null,
                horario != null ? horario.getHorarioInicio() : null,
                horario != null ? horario.getHorarioFim() : null,
                a.situacao(),
                a.conteudo() != null ? a.conteudo().conteudo() : null,
                chamada != null ? (int) (chamada.alunos() - valor(chamada.faltas())) : null,
                chamada != null ? (int) valor(chamada.faltas()) : null,
                a.registradoEm(),
                anotacoes.stream().map(an -> new AnotacaoAulaDto(
                        an.getAluno().getId(),
                        an.getAluno().getDadosPessoais().getNome(),
                        an.getTipoAnotacao() != null ? an.getTipoAnotacao().name() : null,
                        an.getTipoAnotacao() != null ? an.getTipoAnotacao().getDescricao() : null,
                        an.getObservacao())).toList());
    }

    private AvaliacaoDto avaliacaoDto(AvaliacaoAcompanhada a) {
        var at = a.avaliacaoTurma();
        var avaliacao = at.getAvaliacao();
        return new AvaliacaoDto(
                at.getId(),
                avaliacao.getNome(),
                avaliacao.getTipo() != null ? avaliacao.getTipo().name() : null,
                at.getTurma().getId(),
                at.getTurma().getNome(),
                nomeSerie(at.getTurma()),
                avaliacao.getDisciplina() != null ? avaliacao.getDisciplina().getNome() : null,
                at.getDataAplicacao(),
                a.prazo(),
                a.alunos(),
                a.lancadas(),
                a.media(),
                a.situacao());
    }

    private AnotacaoDto anotacaoDto(Anotacao anotacao) {
        var aula = anotacao.getAula();
        var aluno = anotacao.getAluno();
        var tipo = anotacao.getTipoAnotacao();
        return new AnotacaoDto(
                anotacao.getId(),
                aluno.getId(),
                aluno.getDadosPessoais().getNome(),
                aluno.getDadosPessoais().getMatricula(),
                aula.getTurma().getNome(),
                nomeSerie(aula.getTurma()),
                aula.getDisciplina().getNome(),
                anotacao.getDataAnotacao(),
                tipo != null ? tipo.name() : null,
                tipo != null ? tipo.getDescricao() : null,
                anotacao.getObservacao());
    }

    /** Resumo curto das pendências, cabendo no alerta. */
    static String textoLembrete(Acompanhado a, Contexto ctx) {
        List<String> partes = new ArrayList<>();
        var aulas = a.aulasPendentes(ctx);
        if (!aulas.isEmpty()) {
            var datas = aulas.stream().map(AulaDoDia::data).distinct().sorted().map(DIA_MES::format).toList();
            partes.add(aulas.size() + (aulas.size() == 1 ? " aula sem registro" : " aulas sem registro")
                    + " no diário (" + String.join(", ", datas) + ")");
        }
        var avaliacoes = a.avaliacoesAtrasadas();
        if (!avaliacoes.isEmpty()) {
            var nomes = avaliacoes.stream()
                    .map(x -> x.avaliacaoTurma().getAvaliacao().getNome() + " – " + x.avaliacaoTurma().getTurma().getNome())
                    .toList();
            partes.add(avaliacoes.size() + (avaliacoes.size() == 1 ? " avaliação" : " avaliações")
                    + " com notas em atraso (" + String.join("; ", nomes) + ")");
        }
        var texto = ctx.periodo().getNome() + ": " + String.join(" e ", partes) + ".";
        return texto.length() <= TAMANHO_MAXIMO_ALERTA ? texto : texto.substring(0, TAMANHO_MAXIMO_ALERTA - 1) + "…";
    }

    // ─── Apoio ─────────────────────────────────────────────────────────────

    private Contexto contexto() {
        var agora = LocalDateTime.now(FUSO_ESCOLA);
        int anoLetivo = configuracaoService.anoCorrente();
        var config = configuracaoService.obterOuPadrao(anoLetivo);
        var periodos = config.periodos();
        return new Contexto(agora, anoLetivo, periodos, PeriodosLetivos.corrente(periodos, agora.toLocalDate()),
                config.escala());
    }

    private Map<LocalDate, List<Feriado>> feriados(LocalDate inicio, LocalDate fim) {
        return eventoRepository.findGeraisDoTipoNoPeriodo(TipoEvento.FERIADO, inicio, fim).stream()
                .collect(Collectors.groupingBy(Feriado::data));
    }

    private Map<Long, Integer> contarAlunos(Set<Long> turmaIds) {
        if (turmaIds.isEmpty()) {
            return Map.of();
        }
        Map<Long, Integer> mapa = new HashMap<>();
        for (AlunosPorTurma linha : alunoRepository.contarMatriculadosPorTurma(turmaIds)) {
            mapa.put(linha.turmaId(), linha.alunos().intValue());
        }
        return mapa;
    }

    /** Feriado da escola inteira ou da unidade da turma naquele dia; nulo se não há. */
    private static Feriado feriadoDaTurma(List<Feriado> doDia, Turma turma) {
        if (doDia == null) {
            return null;
        }
        var unidadeId = turma.getUnidade() != null ? turma.getUnidade().getId() : null;
        return doDia.stream()
                .filter(f -> f.unidadeId() == null || f.unidadeId().equals(unidadeId))
                .findFirst()
                .orElse(null);
    }

    private static String feriadoGeral(List<Feriado> doDia) {
        if (doDia == null) {
            return null;
        }
        return doDia.stream().filter(f -> f.unidadeId() == null).map(Feriado::titulo).findFirst().orElse(null);
    }

    /** Presenças / alunos chamados nas aulas registradas; nulo quando não há chamada. */
    private static BigDecimal frequencia(List<AulaDoDia> aulas) {
        long chamados = 0;
        long faltas = 0;
        for (AulaDoDia aula : aulas) {
            if (aula.chamada() != null) {
                chamados += valor(aula.chamada().alunos());
                faltas += valor(aula.chamada().faltas());
            }
        }
        return chamados == 0
                ? null
                : BigDecimal.valueOf((chamados - faltas) * 100.0 / chamados).setScale(ESCALA_FREQUENCIA, RoundingMode.HALF_UP);
    }

    private static BigDecimal media(List<BigDecimal> valores, int casas) {
        var soma = valores.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        return soma.divide(BigDecimal.valueOf(valores.size()), casas, RoundingMode.HALF_UP);
    }

    private static PeriodoDto periodoDto(PeriodoLetivo periodo) {
        return new PeriodoDto(periodo.getNome(), periodo.getDataInicio(), periodo.getDataFim());
    }

    private static String nomeSerie(Turma turma) {
        return turma.getSerie() != null ? turma.getSerie().getNome() : null;
    }

    private static String nomeHorario(Aula aula) {
        var horario = aula.getHorario();
        if (horario == null) {
            return null;
        }
        return horario.getHorarioInicio() != null ? horario.getHorarioInicio().toString() : horario.getNome();
    }

    private static List<String> distintos(Stream<String> valores) {
        return List.copyOf(valores.filter(Objects::nonNull).collect(Collectors.toCollection(TreeSet::new)));
    }

    private static LocalDate min(LocalDate a, LocalDate b) {
        return a.isBefore(b) ? a : b;
    }

    private static LocalDate max(LocalDate a, LocalDate b) {
        return a.isAfter(b) ? a : b;
    }

    private static long valor(Long numero) {
        return numero == null ? 0 : numero;
    }

    private static LocalDateTime noFuso(Instant instante) {
        return instante == null ? null : LocalDateTime.ofInstant(instante, FUSO_ESCOLA);
    }

    // ─── Tipos internos ────────────────────────────────────────────────────

    record Contexto(LocalDateTime agora, int anoLetivo, List<PeriodoLetivo> periodos, PeriodoLetivo periodo,
            EscalaAvaliacao escala) {

        LocalDate hoje() {
            return agora.toLocalDate();
        }

        /** Dentro de algum período letivo do ano (fora das férias). */
        boolean ehLetivo(LocalDate data) {
            return periodos.stream().anyMatch(p -> p.contem(data));
        }

        /** No período corrente e até hoje. */
        boolean noPeriodo(LocalDate data) {
            return data != null && periodo.contem(data) && !data.isAfter(hoje());
        }
    }

    private record ChaveAula(Long aulaId, LocalDate data) {
    }

    private record ChaveTurma(Long turmaId, Long disciplinaId) {
    }

    /** Uma aula da grade num dia específico, com o que o professor lançou para ela. */
    record AulaDoDia(Aula aula, LocalDate data, ConteudoRegistrado conteudo, RegistroChamada chamada,
            SituacaoAula situacao) {

        LocalDateTime registradoEm() {
            var instantes = Stream.of(conteudo != null ? conteudo.registradoEm() : null,
                    chamada != null ? chamada.registradoEm() : null);
            return noFuso(instantes.filter(Objects::nonNull).max(Comparator.naturalOrder()).orElse(null));
        }
    }

    record AvaliacaoAcompanhada(AvaliacaoTurma avaliacaoTurma, int alunos, int lancadas, BigDecimal media,
            LocalDate prazo, SituacaoAvaliacao situacao) {
    }

    /** Grade, diário e avaliações de um professor. */
    record Acompanhado(Professor professor, List<Aula> grade, List<AulaDoDia> diario,
            List<AvaliacaoAcompanhada> avaliacoes) {

        List<AulaDoDia> doPeriodo(Contexto ctx) {
            return diario.stream().filter(a -> ctx.noPeriodo(a.data())).toList();
        }

        int previstas(Contexto ctx) {
            return (int) doPeriodo(ctx).stream().filter(a -> a.situacao() != SituacaoAula.PREVISTA).count();
        }

        List<AulaDoDia> aulasPendentes(Contexto ctx) {
            return doPeriodo(ctx).stream().filter(a -> a.situacao() == SituacaoAula.PENDENTE).toList();
        }

        int avaliacoesAplicadas() {
            return (int) avaliacoes.stream().filter(a -> a.situacao() != SituacaoAvaliacao.AGENDADA).count();
        }

        int avaliacoesLancadas() {
            return (int) avaliacoes.stream().filter(a -> a.situacao() == SituacaoAvaliacao.LANCADA).count();
        }

        List<AvaliacaoAcompanhada> avaliacoesAtrasadas() {
            return avaliacoes.stream().filter(a -> a.situacao() == SituacaoAvaliacao.ATRASADA).toList();
        }

        LocalDateTime ultimoRegistro() {
            return diario.stream().map(AulaDoDia::registradoEm).filter(Objects::nonNull)
                    .max(Comparator.naturalOrder()).orElse(null);
        }

        List<String> disciplinas() {
            return distintos(grade.stream().map(a -> a.getDisciplina().getNome()));
        }

        SituacaoProfessor situacao(Contexto ctx) {
            return DiarioDeClasse.situacaoProfessor(Boolean.TRUE.equals(professor.getAtivo()), !grade.isEmpty(),
                    aulasPendentes(ctx).size(), avaliacoesAtrasadas().size());
        }
    }
}
