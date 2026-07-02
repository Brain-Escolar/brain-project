package br.com.brain.professor;

import br.com.brain.aluno.Aluno;
import br.com.brain.aluno.AlunoRepository;
import br.com.brain.anotacao.AnotacaoRepository;
import br.com.brain.anotacao.dto.AnotacaoAlunoDisciplinaDto;
import br.com.brain.aula.Aula;
import br.com.brain.aula.AulaRepository;
import br.com.brain.chamada.ChamadaRepository;
import br.com.brain.disciplina.Disciplina;
import br.com.brain.disciplina.DisciplinaRepository;
import br.com.brain.exception.ErrosSistema;
import br.com.brain.notas.NotasRepository;
import br.com.brain.notas.dto.NotaDisciplinaItemDto;
import br.com.brain.professor.dto.DetalhamentoAlunoTurmaDto;
import br.com.brain.professor.dto.DetalhamentoTurmaProfessorDto;
import br.com.brain.professor.dto.ListagemDisciplinaTurmasProfessorDto;
import br.com.brain.professor.dto.ListagemTurmaProfessorDto;
import br.com.brain.turma.Turma;
import br.com.brain.turma.TurmaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MinhasTurmasService {

    private final AulaRepository aulaRepository;
    private final AlunoRepository alunoRepository;
    private final NotasRepository notasRepository;
    private final ChamadaRepository chamadaRepository;
    private final AnotacaoRepository anotacaoRepository;
    private final TurmaRepository turmaRepository;
    private final DisciplinaRepository disciplinaRepository;

    public List<ListagemDisciplinaTurmasProfessorDto> listarTurmasAgrupadasPorDisciplina(Long professorId) {
        var aulas = aulaRepository.findByProfessorId(professorId);

        // Agrupado por id da disciplina (não pela entidade) para evitar acionar o
        // equals/hashCode gerado pelo Lombok, que inicializaria as coleções lazy.
        Map<Long, Disciplina> disciplinasPorId = new LinkedHashMap<>();
        Map<Long, Map<Long, Turma>> turmasPorDisciplinaId = new LinkedHashMap<>();
        for (Aula aula : aulas) {
            var disciplinaId = aula.getDisciplina().getId();
            disciplinasPorId.putIfAbsent(disciplinaId, aula.getDisciplina());
            turmasPorDisciplinaId
                    .computeIfAbsent(disciplinaId, id -> new LinkedHashMap<>())
                    .putIfAbsent(aula.getTurma().getId(), aula.getTurma());
        }

        return disciplinasPorId.entrySet().stream()
                .map(entry -> {
                    var disciplinaId = entry.getKey();
                    var disciplina = entry.getValue();
                    var turmas = turmasPorDisciplinaId.get(disciplinaId).values().stream()
                            .map(turma -> montarResumoTurma(turma, disciplinaId))
                            .toList();
                    return new ListagemDisciplinaTurmasProfessorDto(disciplinaId, disciplina.getNome(), turmas);
                })
                .toList();
    }

    public DetalhamentoTurmaProfessorDto detalharAlunosDaTurma(Long professorId, Long turmaId, Long disciplinaId) {
        if (!aulaRepository.existsByProfessorIdAndTurmaIdAndDisciplinaId(professorId, turmaId, disciplinaId)) {
            throw new ErrosSistema.AcessoNegadoException("Você não leciona esta disciplina nesta turma.");
        }

        var alunos = alunoRepository.findByTurmaIdAndMatriculadoTrue(turmaId).stream()
                .sorted(Comparator.comparing(a -> a.getDadosPessoais().getNome()))
                .toList();

        var alunosDto = alunos.stream()
                .map(aluno -> montarDetalheAluno(aluno, disciplinaId))
                .toList();

        var turma = turmaRepository.findById(turmaId)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Turma", turmaId));
        var disciplina = disciplinaRepository.findById(disciplinaId)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Disciplina", disciplinaId));

        var mediaTurma = media(alunosDto.stream().map(DetalhamentoAlunoTurmaDto::media).toList());
        var frequenciaTurma = mediaInteiros(alunosDto.stream().map(DetalhamentoAlunoTurmaDto::frequencia).toList());

        return new DetalhamentoTurmaProfessorDto(
                turma.getId(),
                disciplina.getId(),
                disciplina.getNome(),
                turma.getSerie().getNome(),
                turma.getNome(),
                alunosDto.size(),
                mediaTurma,
                frequenciaTurma,
                alunosDto);
    }

    private ListagemTurmaProfessorDto montarResumoTurma(Turma turma, Long disciplinaId) {
        var alunos = alunoRepository.findByTurmaIdAndMatriculadoTrue(turma.getId());

        var medias = alunos.stream()
                .map(aluno -> calcularMedia(aluno.getId(), disciplinaId))
                .toList();
        var frequencias = alunos.stream()
                .map(aluno -> calcularFrequencia(aluno.getId(), disciplinaId))
                .toList();

        return new ListagemTurmaProfessorDto(
                turma.getId(),
                turma.getSerie().getNome(),
                turma.getNome(),
                alunos.size(),
                media(medias),
                mediaInteiros(frequencias));
    }

    private DetalhamentoAlunoTurmaDto montarDetalheAluno(Aluno aluno, Long disciplinaId) {
        var notas = notasRepository.findByAlunoIdAndAvaliacaoTurmaAvaliacaoDisciplinaId(aluno.getId(), disciplinaId).stream()
                .map(NotaDisciplinaItemDto::new)
                .toList();
        var anotacoes = anotacaoRepository.findByDisciplinaIdAndAlunoId(disciplinaId, aluno.getId()).stream()
                .map(AnotacaoAlunoDisciplinaDto::new)
                .toList();

        var faltas = chamadaRepository.countFaltasByAlunoAndDisciplina(aluno.getId(), disciplinaId);
        var media = calcularMedia(aluno.getId(), disciplinaId);
        var frequencia = calcularFrequencia(aluno.getId(), disciplinaId);

        return new DetalhamentoAlunoTurmaDto(
                aluno.getId(),
                aluno.getDadosPessoais().getNome(),
                aluno.getDadosPessoais().getMatricula(),
                notas,
                media,
                faltas == null ? 0 : faltas,
                frequencia,
                anotacoes);
    }

    private BigDecimal calcularMedia(Long alunoId, Long disciplinaId) {
        var notas = notasRepository.findByAlunoIdAndAvaliacaoTurmaAvaliacaoDisciplinaId(alunoId, disciplinaId);
        if (notas.isEmpty()) {
            return null;
        }
        var soma = notas.stream().map(n -> n.getPontuacao()).reduce(BigDecimal.ZERO, BigDecimal::add);
        return soma.divide(BigDecimal.valueOf(notas.size()), 1, RoundingMode.HALF_UP);
    }

    private Integer calcularFrequencia(Long alunoId, Long disciplinaId) {
        var total = chamadaRepository.countTotalByAlunoAndDisciplina(alunoId, disciplinaId);
        if (total == null || total == 0) {
            return null;
        }
        var faltas = chamadaRepository.countFaltasByAlunoAndDisciplina(alunoId, disciplinaId);
        faltas = faltas == null ? 0 : faltas;
        return (int) Math.round((total - faltas) * 100.0 / total);
    }

    private BigDecimal media(List<BigDecimal> valores) {
        var validos = valores.stream().filter(v -> v != null).toList();
        if (validos.isEmpty()) {
            return null;
        }
        var soma = validos.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        return soma.divide(BigDecimal.valueOf(validos.size()), 1, RoundingMode.HALF_UP);
    }

    private Integer mediaInteiros(List<Integer> valores) {
        var validos = valores.stream().filter(v -> v != null).toList();
        if (validos.isEmpty()) {
            return null;
        }
        var soma = validos.stream().mapToInt(Integer::intValue).sum();
        return (int) Math.round(soma / (double) validos.size());
    }
}
