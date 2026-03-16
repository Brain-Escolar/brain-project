package br.com.brain.service;

import br.com.brain.domain.professor.Professor;
import br.com.brain.domain.tarefa.Tarefa;
import br.com.brain.domain.tarefa.TarefaRepository;
import br.com.brain.dto.tarefa.AtualizacaoTarefaDto;
import br.com.brain.dto.tarefa.CadastroTarefaDto;
import br.com.brain.dto.tarefa.ListagemTarefaDto;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
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

        var tarefa = new Tarefa();
        tarefa.setProfessor(professor);
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
                        () -> new EntityNotFoundException("Tarefa de id " + id + " não existe."));

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
                        () -> new EntityNotFoundException("Tarefa de id " + id + " não existe."));
        repository.delete(tarefa);
    }

    public Tarefa detalhar(Long id) {
        return repository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Tarefa de id " + id + " não existe."));
    }

    public Page<ListagemTarefaDto> recuperarTarefasProfessor(Long id, Pageable paginacao) {
        var hoje = LocalDate.now();
        return repository.findByProfessorIdAndPrazoAfter(id, hoje, paginacao).map(ListagemTarefaDto::new);
    }
}
