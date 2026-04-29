package br.com.brain.service;

import br.com.brain.domain.aula.AulaRepository;
import br.com.brain.domain.professor.Professor;
import br.com.brain.domain.tarefa.Tarefa;
import br.com.brain.domain.turma.Turma;
import br.com.brain.domain.tarefa.TarefaRepository;
import br.com.brain.dto.tarefa.AtualizacaoTarefaDto;
import br.com.brain.dto.tarefa.CadastroTarefaDto;
import br.com.brain.dto.tarefa.ListagemTarefaDto;
import br.com.brain.dto.tarefa.ListagemTarefaAlunoDto;
import br.com.brain.exception.ErrosSistema;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TarefaService {

    private final TarefaRepository repository;
    private final AulaRepository aulaRepository;

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public Tarefa cadastrarTarefa(CadastroTarefaDto dados, Professor professor) {

        var turma = em.getReference(Turma.class, dados.turmaId());

        var tarefa = new Tarefa();
        tarefa.setProfessor(professor);
        tarefa.setTurma(turma);
        tarefa.setConteudo(dados.conteudo());
        tarefa.setDataCriacao(LocalDate.now());
        tarefa.setDocumentoUrl(dados.documentoUrl());
        tarefa.setPrazo(dados.prazo());
        tarefa.setTitulo(dados.titulo());

        repository.save(tarefa);

        return tarefa;
    }

    public Page<ListagemTarefaDto> listar(Pageable paginacao) {
        return repository.findAll(paginacao).map(ListagemTarefaDto::new);
    }

    @Transactional
    public Tarefa atualizar(AtualizacaoTarefaDto dados, Long id) {
        var tarefa = repository
                .findById(id)
                .orElseThrow(
                        () -> ErrosSistema.RecursoNaoEncontradoException.para("Tarefa", id));

        if (dados.titulo() != null) {
            tarefa.setTitulo(dados.titulo());
        }
        if (dados.conteudo() != null) {
            tarefa.setConteudo(dados.conteudo());
        }
        if (dados.documentoUrl() != null) {
            tarefa.setDocumentoUrl(dados.documentoUrl());
        }
        if (dados.professorId() != null) {
            var professor = em.getReference(Professor.class, dados.professorId());
            tarefa.setProfessor(professor);
        }
        if (dados.turmaId() != null) {
            var turma = em.getReference(Turma.class, dados.turmaId());
            tarefa.setTurma(turma);
        }
        if (dados.prazo() != null) {
            tarefa.setPrazo(dados.prazo());
        }
        repository.save(tarefa);

        return tarefa;
    }

    @Transactional
    public void excluir(Long id) {
        var tarefa = repository
                .findById(id)
                .orElseThrow(
                        () -> ErrosSistema.RecursoNaoEncontradoException.para("Tarefa", id));
        repository.delete(tarefa);
    }

    public Tarefa detalhar(Long id) {
        return repository
                .findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Tarefa", id));
    }

    public Page<ListagemTarefaDto> recuperarTarefasProfessor(Long id, Pageable paginacao) {
        var hoje = LocalDate.now();
        return repository.findByProfessorIdAndPrazoAfter(id, hoje, paginacao).map(ListagemTarefaDto::new);
    }

    public List<ListagemTarefaDto> listarTarefasPorAula(Long aulaId, LocalDate data) {
        var aula = aulaRepository.findById(aulaId)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Aula", aulaId));
        return repository.findByTurmaIdAndPrazo(aula.getTurma().getId(), data)
                .stream().map(ListagemTarefaDto::new).toList();
    }

    public List<String> listarDatasComTarefas(Long aulaId) {
        var aula = aulaRepository.findById(aulaId)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Aula", aulaId));
        return repository.findDistinctPrazoByTurmaId(aula.getTurma().getId())
                .stream().map(LocalDate::toString).toList();
    }

    public Page<ListagemTarefaAlunoDto> recuperarTarefasAluno(Long turmaId, Pageable paginacao) {
        var hoje = LocalDate.now();
        return repository.findByTurmaIdAndPrazoGreaterThanEqual(turmaId, hoje, paginacao)
                .map(ListagemTarefaAlunoDto::new);
    }
}
