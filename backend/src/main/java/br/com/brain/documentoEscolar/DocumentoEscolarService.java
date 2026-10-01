package br.com.brain.documentoEscolar;

import br.com.brain.aluno.Aluno;
import br.com.brain.aluno.AlunoService;
import br.com.brain.chamada.ChamadaRepository;
import br.com.brain.configuracaoAcademica.ConfiguracaoAcademicaService;
import br.com.brain.configuracaoAcademica.PeriodoLetivo;
import br.com.brain.dadosPessoais.DadosPessoais;
import br.com.brain.disciplina.Disciplina;
import br.com.brain.disciplina.DisciplinaRepository;
import br.com.brain.documentoEscolar.dto.AlunoDocumentoDto;
import br.com.brain.documentoEscolar.dto.AnoHistoricoDto;
import br.com.brain.documentoEscolar.dto.BoletimDto;
import br.com.brain.documentoEscolar.dto.ComponenteHistoricoDto;
import br.com.brain.documentoEscolar.dto.EscolaDocumentoDto;
import br.com.brain.documentoEscolar.dto.HistoricoDto;
import br.com.brain.documentoEscolar.dto.NotaAnoHistoricoDto;
import br.com.brain.escola.EscolaService;
import br.com.brain.escola.dto.DetalhamentoEscolaDto;
import br.com.brain.exception.ErrosSistema;
import br.com.brain.infra.multitenancy.TenantContext;
import br.com.brain.notas.NotasRepository;
import br.com.brain.relatorios.RelatoriosService;
import br.com.brain.relatorios.dto.DisciplinaRelatorioDto;
import br.com.brain.relatorios.dto.RelatorioDto;
import br.com.brain.turma.Turma;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.TreeMap;
import java.util.stream.Stream;

/**
 * Emissão de documentos escolares pela secretaria: boletim e histórico.
 *
 * O aluno guarda só a turma atual, então a trilha ano a ano é reconstruída
 * pelas turmas em que ele teve nota ou chamada. Notas, médias, frequência e
 * situação vêm do {@link RelatoriosService}, a mesma regra do boletim do aluno.
 */
@Service
@RequiredArgsConstructor
public class DocumentoEscolarService {

    private static final String SEM_AREA = "Outros componentes";

    private final AlunoService alunoService;
    private final RelatoriosService relatoriosService;
    private final ConfiguracaoAcademicaService configuracaoService;
    private final NotasRepository notasRepository;
    private final ChamadaRepository chamadaRepository;
    private final DisciplinaRepository disciplinaRepository;
    private final EscolaService escolaService;

    @Transactional(readOnly = true)
    public BoletimDto gerarBoletim(Long alunoId, Integer anoLetivo, Integer periodoAte, DadosPessoais emissor) {
        var aluno = alunoService.detalhar(alunoId);
        var turmasPorAno = turmasPorAno(aluno);
        int ano = anoLetivo != null ? anoLetivo : anoPadrao(turmasPorAno);
        var turma = turmasPorAno.get(ano);
        var anos = turmasPorAno.descendingKeySet().stream().toList();

        if (turma == null || turma.getSerie() == null) {
            return new BoletimDto(escola(aluno, turma), montarAluno(aluno), anos, ano,
                    null, null, null, null, nome(emissor), LocalDateTime.now());
        }

        var periodos = configuracaoService.obterOuPadrao(ano).periodos();
        int ultimoIniciado = ultimoPeriodoIniciado(periodos);
        if (periodoAte != null && (periodoAte < 1 || periodoAte > ultimoIniciado)) {
            throw ErrosSistema.OperacaoInvalidaException.com("Período inválido para o boletim de " + ano + ".");
        }
        int ate = periodoAte != null ? periodoAte : ultimoIniciado;
        var relatorio = relatoriosService.gerarRelatorio(aluno, turma, ate);

        return new BoletimDto(
                escola(aluno, turma),
                montarAluno(aluno),
                anos,
                ano,
                ate,
                ultimoIniciado,
                turma.getTurno() != null ? turma.getTurno().getTipo() : null,
                relatorio,
                nome(emissor),
                LocalDateTime.now());
    }

    @Transactional(readOnly = true)
    public HistoricoDto gerarHistorico(Long alunoId, DadosPessoais emissor) {
        var aluno = alunoService.detalhar(alunoId);
        var turmasPorAno = turmasPorAno(aluno);
        int anoAtual = LocalDate.now().getYear();

        List<AnoHistoricoDto> anos = new ArrayList<>();
        // nome da disciplina (normalizado) -> área, nome de exibição e nota por ano
        Map<String, ComponenteAcumulado> componentes = new LinkedHashMap<>();
        RelatorioDto ultimo = null;

        for (var entrada : turmasPorAno.entrySet()) {
            int ano = entrada.getKey();
            var turma = entrada.getValue();
            if (turma.getSerie() == null) {
                continue;
            }
            var relatorio = relatoriosService.gerarRelatorio(aluno, turma, null);
            ultimo = relatorio;
            Map<Long, Disciplina> disciplinas = new LinkedHashMap<>();
            disciplinaRepository.findBySerieIdOrderByNomeAsc(turma.getSerie().getId())
                    .forEach(d -> disciplinas.put(d.getId(), d));

            int cargaHoraria = 0;
            for (DisciplinaRelatorioDto linha : relatorio.disciplinas()) {
                var disciplina = disciplinas.get(linha.disciplinaId());
                int ch = disciplina != null ? disciplina.getCargaHoraria() : 0;
                cargaHoraria += ch;
                componentes
                        .computeIfAbsent(chave(linha.nome()), k -> new ComponenteAcumulado(area(disciplina), linha.nome()))
                        .notas.put(ano, new NotaAnoHistoricoDto(ano, linha.notaFinal(), ch));
            }

            anos.add(new AnoHistoricoDto(
                    ano,
                    turma.getSerie().getNome(),
                    turma.getNome(),
                    turma.getUnidade() != null ? turma.getUnidade().getNome() : null,
                    ano >= anoAtual,
                    cargaHoraria,
                    relatorio.resumo().frequenciaGeral(),
                    relatorio.resumo().situacaoFinal()));
        }

        var anosCursados = anos.stream().map(AnoHistoricoDto::anoLetivo).toList();
        var linhas = componentes.values().stream()
                .sorted(Comparator.comparing((ComponenteAcumulado c) -> SEM_AREA.equals(c.area))
                        .thenComparing(c -> c.area)
                        .thenComparing(c -> c.nome))
                .map(c -> new ComponenteHistoricoDto(c.area, c.nome, anosCursados.stream()
                        .map(a -> c.notas.getOrDefault(a, new NotaAnoHistoricoDto(a, null, null)))
                        .toList()))
                .toList();

        var escala = ultimo != null ? ultimo.gradingScale() : null;
        return new HistoricoDto(
                escola(aluno, aluno.getTurma()),
                montarAluno(aluno),
                ultimo != null ? ultimo.notaAprovacao() : null,
                ultimo != null ? 100 - ultimo.percentualLimiteFaltas() : null,
                escala != null ? escala.decimalPlaces() : null,
                anos,
                linhas,
                nome(emissor),
                LocalDateTime.now());
    }

    /**
     * Turma do aluno em cada ano letivo: a atual mais as que aparecem nas notas
     * e nas chamadas. Se houver mais de uma no mesmo ano (troca de turma), vale
     * a atual; senão, a de maior id (a mais recente).
     */
    private TreeMap<Integer, Turma> turmasPorAno(Aluno aluno) {
        TreeMap<Integer, Turma> porAno = new TreeMap<>();
        Stream.concat(
                        notasRepository.findTurmasComNotaDoAluno(aluno.getId()).stream(),
                        chamadaRepository.findTurmasComChamadaDoAluno(aluno.getId()).stream())
                .filter(Objects::nonNull)
                .forEach(t -> porAno.merge(t.getAnoLetivo(), t, (a, b) -> a.getId() >= b.getId() ? a : b));
        if (aluno.getTurma() != null) {
            porAno.put(aluno.getTurma().getAnoLetivo(), aluno.getTurma());
        }
        return porAno;
    }

    /** Ano em curso quando o aluno tem turma nele; senão o último ano cursado. */
    private int anoPadrao(TreeMap<Integer, Turma> turmasPorAno) {
        int anoAtual = LocalDate.now().getYear();
        if (turmasPorAno.isEmpty() || turmasPorAno.containsKey(anoAtual)) {
            return anoAtual;
        }
        return turmasPorAno.lastKey();
    }

    private int ultimoPeriodoIniciado(List<PeriodoLetivo> periodos) {
        LocalDate hoje = LocalDate.now();
        return periodos.stream()
                .filter(p -> !p.getDataInicio().isAfter(hoje))
                .mapToInt(PeriodoLetivo::getSequencia)
                .max()
                // Ano que ainda não começou: libera o primeiro período (sairá sem notas).
                .orElse(periodos.isEmpty() ? 1 : periodos.get(0).getSequencia());
    }

    private EscolaDocumentoDto escola(Aluno aluno, Turma turma) {
        var escola = escolaService.buscarPorSchema(TenantContext.getTenantId());
        var unidade = turma != null && turma.getUnidade() != null ? turma.getUnidade()
                : aluno.getUnidade();
        return new EscolaDocumentoDto(
                escola.map(DetalhamentoEscolaDto::nome).orElse(null),
                escola.map(DetalhamentoEscolaDto::cnpj).orElse(null),
                unidade != null ? unidade.getNome() : null);
    }

    private AlunoDocumentoDto montarAluno(Aluno aluno) {
        var dp = aluno.getDadosPessoais();
        var turma = aluno.getTurma();
        var serie = turma != null && turma.getSerie() != null ? turma.getSerie() : aluno.getSerie();
        var unidade = turma != null && turma.getUnidade() != null ? turma.getUnidade() : aluno.getUnidade();
        return new AlunoDocumentoDto(
                aluno.getId(),
                dp.getNome(),
                dp.getMatricula(),
                dp.getDataDeNascimento(),
                dp.getCpf(),
                dp.getCidadeNaturalidade(),
                serie != null ? serie.getNome() : null,
                turma != null ? turma.getNome() : null,
                unidade != null ? unidade.getNome() : null,
                Boolean.TRUE.equals(aluno.getMatriculado()),
                aluno.getDataDesmatricula(),
                aluno.getMotivoDesmatricula());
    }

    private String area(Disciplina disciplina) {
        var grupo = disciplina != null ? disciplina.getGrupo() : null;
        if (grupo == null) {
            return SEM_AREA;
        }
        if (grupo.getArea() != null && !grupo.getArea().isBlank()) {
            return grupo.getArea();
        }
        return grupo.getNome() != null && !grupo.getNome().isBlank() ? grupo.getNome() : SEM_AREA;
    }

    private String chave(String nome) {
        return nome == null ? "" : nome.trim().toLowerCase();
    }

    private String nome(DadosPessoais emissor) {
        return emissor != null ? emissor.getNome() : null;
    }

    private static final class ComponenteAcumulado {
        private final String area;
        private final String nome;
        private final Map<Integer, NotaAnoHistoricoDto> notas = new TreeMap<>();

        private ComponenteAcumulado(String area, String nome) {
            this.area = area;
            this.nome = nome;
        }
    }
}
