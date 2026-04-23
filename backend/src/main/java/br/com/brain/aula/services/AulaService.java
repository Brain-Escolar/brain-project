package br.com.brain.aula.services;

import br.com.brain.aluno.domain.Aluno;
import br.com.brain.aula.domain.Aula;
import br.com.brain.aula.domain.AulaRepository;
import br.com.brain.disciplina.domain.Disciplina;
import br.com.brain.horario.domain.Horario;
import br.com.brain.professor.domain.Professor;
import br.com.brain.turma.domain.Turma;
import br.com.brain.aula.dtos.AtualizacaoAulaDto;
import br.com.brain.aula.dtos.CadastroAulaDto;
import br.com.brain.aula.dtos.ListagemAulaDto;
import br.com.brain.aula.dtos.ProximaAulaDto;
import br.com.brain.shared.exception.ErrosSistema;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.Comparator;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AulaService {

    private final AulaRepository repository;

    private final AlunoService alunoService;

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public Aula cadastrarAula(CadastroAulaDto dados) {

        Disciplina disciplina = em.getReference(Disciplina.class, dados.disciplinaId());
        Horario horario = em.getReference(Horario.class, dados.horarioId());
        Turma turma = em.getReference(Turma.class, dados.turmaId());
        var aula = new Aula();
        aula.setDisciplina(disciplina);
        aula.setHorario(horario);
        aula.setDiaSemana(dados.diaSemana());
        aula.setTurma(turma);
        if (dados.professorId() != null) {
            Professor professor = em.getReference(Professor.class, dados.professorId());
            aula.setProfessor(professor);
        }
        repository.save(aula);

        return aula;
    }

    public Page<ListagemAulaDto> listar(Pageable paginacao) {
        return repository.findAll(paginacao).map(ListagemAulaDto::new);
    }

    @Transactional
    public Aula atualizar(AtualizacaoAulaDto dados, Long id) {
        var aula = repository.findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Aula", id));

        if (dados.disciplinaId() != null) {
            Disciplina disciplina = em.getReference(Disciplina.class, dados.professorId());
            aula.setDisciplina(disciplina);
        }
        if (dados.professorId() != null) {
            Professor professor = em.getReference(Professor.class, dados.professorId());
            aula.setProfessor(professor);
        }
        if (dados.horarioId() != null) {
            Horario horario = em.getReference(Horario.class, dados.horarioId());
            aula.setHorario(horario);
        }
        if (dados.diaSemana() != null) {
            aula.setDiaSemana(dados.diaSemana());
        }
        if (dados.turmaId() != null) {
            Turma turma = em.getReference(Turma.class, dados.turmaId());
            aula.setTurma(turma);
        }

        repository.save(aula);

        return aula;
    }

    @Transactional
    public void excluir(Long id) {
        var aula = repository.findById(id).get();
        repository.delete(aula);
    }

    public Aula detalhar(Long id) {
        return repository.findById(id).get();
    }

    public Page<ListagemAulaDto> recuperarAulasPeloProfessorEData(Long professorId, LocalDate data,
            Pageable paginacao) {
        if (data == null) {
            throw new ErrosSistema.DataInvalidaException("Data não pode ser nula.");
        }
        var diaSemana = data.getDayOfWeek();
        return repository.findByProfessorIdAndDiaSemana(professorId, diaSemana, paginacao).map(ListagemAulaDto::new);
    }

    public List<Aluno> recuperarAlunos(Long id) {
        var aula = repository.findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Aula", id));
        List<Aluno> alunos = alunoService.recuperarAlunosPorUnidadeSerieTurma(aula.getTurma().getUnidade().getId(),
                aula.getTurma().getSerie().getId(), aula.getTurma().getId());
        return alunos;
    }

    public Disciplina recuperarDisciplina(Long aulaId) {
        var aula = repository.findById(aulaId)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Aula", aulaId));
        return aula.getDisciplina();
    }

    public List<Disciplina> recuperarDisciplinasPorProfessorEAno(Long id, Integer ano) {
        LocalDate dataInicio = LocalDate.of(ano, 1, 1);
        LocalDate dataFim = LocalDate.of(ano, 12, 31);
        return repository.findDisciplinasByProfessorIdAndData(id, dataInicio, dataFim);
    }

    public List<Aula> recuperarAulasPorProfessorEAno(Long id, Integer ano) {
        LocalDate dataInicio = LocalDate.of(ano, 1, 1);
        LocalDate dataFim = LocalDate.of(ano, 12, 31);
        return repository.findByProfessorIdAndVigenciaBetween(id, dataInicio, dataFim);
    }

    public List<Turma> recuperarTurmasPorDisciplina(Long id) {
        return repository.findTurmasByDisciplinaId(id);
    }

    public ProximaAulaDto recuperarProximaAula(Long aulaId, LocalDate data, LocalTime horario) {
        var aula = repository.findById(aulaId)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Aula", aulaId));

        var aulasDaDisciplina = repository.findByDisciplinaId(aula.getDisciplina().getId());

        return aulasDaDisciplina.stream()
                .map(a -> {
                    LocalTime inicioAula = a.getHorario().getHorarioInicio();
                    boolean mesmodia = a.getDiaSemana() == data.getDayOfWeek();
                    LocalDate proximaData = (mesmodia && inicioAula.isAfter(horario))
                            ? data
                            : data.with(TemporalAdjusters.next(a.getDiaSemana()));
                    return new ProximaAulaDto(a.getId(), proximaData, inicioAula, a.getHorario().getHorarioFim());
                })
                .min(Comparator.comparing(ProximaAulaDto::data)
                        .thenComparing(ProximaAulaDto::horarioInicio))
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Disciplina",
                        aula.getDisciplina().getId()));
    }
}
