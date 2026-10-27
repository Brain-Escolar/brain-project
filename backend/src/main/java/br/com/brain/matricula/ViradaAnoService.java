package br.com.brain.matricula;

import br.com.brain.configuracaoAcademica.AnoLetivoService;
import br.com.brain.configuracaoAcademica.PeriodoLetivoRepository;
import br.com.brain.disciplina.Disciplina;
import br.com.brain.disciplina.DisciplinaRepository;
import br.com.brain.enums.StatusMatricula;
import br.com.brain.exception.ErrosSistema;
import br.com.brain.matricula.dto.CopiaTurmasDto;
import br.com.brain.matricula.dto.EncerramentoAnoDto;
import br.com.brain.matricula.dto.PreviaEncerramentoDto;
import br.com.brain.matricula.dto.RematriculaDto;
import br.com.brain.matricula.dto.RematriculaRequest;
import br.com.brain.relatorios.RelatoriosService;
import br.com.brain.relatorios.dto.DisciplinaRelatorioDto;
import br.com.brain.serie.Serie;
import br.com.brain.turma.Turma;
import br.com.brain.turma.TurmaRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Virada do ano letivo, em três passos que a direção dispara na ordem:
 *
 * <ol>
 * <li>{@link #copiarTurmas}: monta as turmas do ano em planejamento a partir
 * das do ano anterior;</li>
 * <li>{@link #encerrar}: congela o resultado de cada aluno e fecha o ano;</li>
 * <li>{@link #rematricular}: cria as pré-matrículas do ano seguinte
 * (aprovado sobe de série, reprovado repete).</li>
 * </ol>
 *
 * Depois disso, abrir o ano novo ({@code AnoLetivoService.abrir}) troca o ano
 * corrente de todas as telas.
 */
@Service
@RequiredArgsConstructor
public class ViradaAnoService {

    static final String APROVADO = "APROVADO";
    static final String REPROVADO = "REPROVADO";
    // Mesmo rótulo do histórico escolar (DocumentoEscolarService).
    private static final String SEM_AREA = "Outros componentes";

    private final AnoLetivoService anoLetivoService;
    private final PeriodoLetivoRepository periodoLetivoRepository;
    private final MatriculaRepository matriculaRepository;
    private final ResultadoDisciplinaRepository resultadoRepository;
    private final TurmaRepository turmaRepository;
    private final DisciplinaRepository disciplinaRepository;
    private final RelatoriosService relatoriosService;
    private final EntityManager em;

    // ---------------------------------------------------------------- encerrar

    @Transactional(readOnly = true)
    public PreviaEncerramentoDto previaEncerramento(int ano) {
        anoLetivoService.exigirAberto(ano);
        long efetivadas = matriculaRepository.countByAnoLetivoAndStatus(ano, StatusMatricula.EFETIVADA);
        long semTurma = matriculaRepository.countSemTurma(ano, StatusMatricula.EFETIVADA);
        long abertos = periodoLetivoRepository.findByAnoLetivoOrderBySequenciaAsc(ano).stream()
                .filter(p -> !p.isFechado())
                .count();
        return new PreviaEncerramentoDto(ano, efetivadas - semTurma, semTurma,
                matriculaRepository.countByAnoLetivoAndStatus(ano, StatusMatricula.PRE_MATRICULA), abertos);
    }

    /**
     * Encerra o ano corrente. Tudo numa transação: o resultado de cada aluno é
     * calculado uma última vez pelas mesmas regras do boletim e gravado; as
     * matrículas efetivadas viram CONCLUIDA; pré-matrículas nunca efetivadas são
     * canceladas; os períodos fecham e o ano vira ENCERRADO (somente leitura).
     */
    @Transactional
    public EncerramentoAnoDto encerrar(int ano) {
        anoLetivoService.exigirAberto(ano);

        int concluidas = 0, aprovadas = 0, reprovadas = 0, semResultado = 0, canceladas = 0;
        Map<Long, Map<Long, Disciplina>> disciplinasPorSerie = new HashMap<>();

        var matriculas = matriculaRepository.findDoAnoComAluno(ano,
                EnumSet.of(StatusMatricula.EFETIVADA, StatusMatricula.PRE_MATRICULA));
        for (var matricula : matriculas) {
            if (matricula.getStatus() == StatusMatricula.PRE_MATRICULA) {
                matricula.setStatus(StatusMatricula.CANCELADA);
                matricula.setDataSaida(LocalDate.now());
                matricula.setMotivoSaida("Ano letivo " + ano + " encerrado sem efetivação da matrícula.");
                canceladas++;
                continue;
            }

            matricula.setStatus(StatusMatricula.CONCLUIDA);
            concluidas++;
            var turma = matricula.getTurma();
            if (turma == null || turma.getSerie() == null) {
                continue;
            }

            var relatorio = relatoriosService.gerarRelatorio(matricula.getAluno(), turma, null);
            var disciplinas = disciplinasPorSerie.computeIfAbsent(turma.getSerie().getId(),
                    serieId -> disciplinaRepository.findBySerieIdOrderByNomeAsc(serieId).stream()
                            .collect(Collectors.toMap(Disciplina::getId, Function.identity())));
            for (DisciplinaRelatorioDto linha : relatorio.disciplinas()) {
                resultadoRepository.save(resultado(matricula, linha, disciplinas.get(linha.disciplinaId())));
            }

            var resumo = relatorio.resumo();
            matricula.setSituacaoFinal(resumo.situacaoFinal());
            matricula.setMediaFinal(resumo.mediaGeral());
            matricula.setFrequenciaFinal(resumo.frequenciaGeral());
            if (APROVADO.equals(resumo.situacaoFinal())) {
                aprovadas++;
            } else if (REPROVADO.equals(resumo.situacaoFinal())) {
                reprovadas++;
            } else {
                semResultado++;
            }
        }

        anoLetivoService.registrarEncerramento(ano);
        return new EncerramentoAnoDto(ano, concluidas, aprovadas, reprovadas, semResultado, canceladas);
    }

    private ResultadoDisciplina resultado(Matricula matricula, DisciplinaRelatorioDto linha, Disciplina disciplina) {
        var r = new ResultadoDisciplina();
        r.setMatricula(matricula);
        r.setDisciplina(disciplina);
        r.setDisciplinaNome(linha.nome());
        r.setArea(area(disciplina));
        r.setCargaHoraria(disciplina != null ? disciplina.getCargaHoraria() : null);
        r.setNotaAnual(linha.notaAnual());
        r.setRecuperacao(linha.recuperacao());
        r.setNotaFinal(linha.notaFinal());
        r.setTotalFaltas(linha.totalFaltas());
        r.setTotalAulas(linha.totalAulas());
        r.setFrequencia(linha.frequencia());
        r.setSituacao(linha.situacao());
        return r;
    }

    static String area(Disciplina disciplina) {
        var grupo = disciplina != null ? disciplina.getGrupo() : null;
        if (grupo == null) {
            return SEM_AREA;
        }
        if (grupo.getArea() != null && !grupo.getArea().isBlank()) {
            return grupo.getArea();
        }
        return grupo.getNome() != null && !grupo.getNome().isBlank() ? grupo.getNome() : SEM_AREA;
    }

    // ----------------------------------------------------------- copiar turmas

    /**
     * Cria no ano de destino uma turma para cada turma do ano anterior (mesmo
     * nome, unidade, série, turno, sala e vagas). Turma que já existe no destino
     * não é duplicada, então dá para repetir o passo depois de criar turmas novas.
     */
    @Transactional
    public CopiaTurmasDto copiarTurmas(int anoDestino) {
        int anoOrigem = anoDestino - 1;
        anoLetivoService.garantir(anoDestino);

        int criadas = 0, jaExistiam = 0;
        for (Turma origem : turmaRepository.findByAnoLetivoOrderByNomeAsc(anoOrigem)) {
            if (turmaRepository.existsByAnoLetivoAndNomeAndUnidadeIdAndSerieId(anoDestino, origem.getNome(),
                    origem.getUnidade().getId(), origem.getSerie().getId())) {
                jaExistiam++;
                continue;
            }
            var nova = new Turma();
            nova.setNome(origem.getNome());
            nova.setAnoLetivo(anoDestino);
            nova.setUnidade(origem.getUnidade());
            nova.setSerie(origem.getSerie());
            nova.setTurno(origem.getTurno());
            nova.setSala(origem.getSala());
            nova.setVagas(origem.getVagas());
            turmaRepository.save(nova);
            criadas++;
        }
        return new CopiaTurmasDto(anoOrigem, anoDestino, criadas, jaExistiam);
    }

    // ------------------------------------------------------------- rematricular

    /**
     * Pré-matrícula no ano de destino para cada aluno que concluiu o ano
     * anterior: aprovado vai para a série indicada em {@code pedido}, reprovado
     * repete a série. Sem turma e sem contrato: enturmar e efetivar (CRM)
     * continuam sendo da secretaria. Aluno que já tem matrícula viva no destino
     * é pulado, então o passo pode ser repetido.
     */
    @Transactional
    public RematriculaDto rematricular(int anoDestino, RematriculaRequest pedido) {
        int anoOrigem = anoDestino - 1;
        anoLetivoService.exigirEncerrado(anoOrigem);
        anoLetivoService.garantir(anoDestino);

        Map<Long, Long> destinoPorSerie = new HashMap<>();
        Set<Long> seriesFinais = new HashSet<>();
        for (var promocao : pedido.promocoes()) {
            if (promocao.serieDestinoId() == null) {
                seriesFinais.add(promocao.serieOrigemId());
            } else {
                destinoPorSerie.put(promocao.serieOrigemId(), promocao.serieDestinoId());
            }
        }

        int criadas = 0, jaMatriculados = 0, concluintes = 0, semResultado = 0, semDestino = 0;
        for (var concluida : matriculaRepository.findDoAnoComAluno(anoOrigem, List.of(StatusMatricula.CONCLUIDA))) {
            var aluno = concluida.getAluno();
            if (!Boolean.TRUE.equals(aluno.getMatriculado())) {
                continue;
            }
            Long serieDestino;
            if (APROVADO.equals(concluida.getSituacaoFinal())) {
                Long serieOrigem = concluida.getSerie().getId();
                if (seriesFinais.contains(serieOrigem)) {
                    concluintes++;
                    continue;
                }
                serieDestino = destinoPorSerie.get(serieOrigem);
                if (serieDestino == null) {
                    semDestino++;
                    continue;
                }
            } else if (REPROVADO.equals(concluida.getSituacaoFinal())) {
                serieDestino = concluida.getSerie().getId();
            } else {
                semResultado++;
                continue;
            }

            boolean jaTemViva = matriculaRepository.findByAlunoIdAndAnoLetivoOrderByIdDesc(aluno.getId(), anoDestino)
                    .stream()
                    .anyMatch(m -> MatriculaRepository.VIVAS.contains(m.getStatus()));
            if (jaTemViva) {
                jaMatriculados++;
                continue;
            }

            var nova = new Matricula();
            nova.setAluno(aluno);
            nova.setAnoLetivo(anoDestino);
            nova.setUnidade(concluida.getUnidade());
            nova.setSerie(em.getReference(Serie.class, serieDestino));
            nova.setTurno(concluida.getTurno());
            nova.setStatus(StatusMatricula.PRE_MATRICULA);
            matriculaRepository.save(nova);
            criadas++;
        }

        if (criadas == 0 && jaMatriculados == 0 && concluintes == 0 && semResultado == 0 && semDestino == 0) {
            throw ErrosSistema.OperacaoInvalidaException.com(
                    "Nenhum aluno concluiu " + anoOrigem + ": não há quem rematricular.");
        }
        return new RematriculaDto(anoOrigem, anoDestino, criadas, jaMatriculados, concluintes, semResultado,
                semDestino);
    }
}
