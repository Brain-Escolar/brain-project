package br.com.brain.tarefa.services;

import br.com.brain.professor.domain.Professor;
import br.com.brain.tarefa.domain.Tarefa;
import br.com.brain.turma.domain.Turma;
import br.com.brain.tarefa.domain.TarefaRepository;
import br.com.brain.tarefa.dtos.AtualizacaoTarefaDto;
import br.com.brain.tarefa.dtos.CadastroTarefaDto;
import br.com.brain.tarefa.dtos.ListagemTarefaDto;
import br.com.brain.shared.exception.ErrosSistema;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TarefaService {

    private final TarefaRepository repository;

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
}
