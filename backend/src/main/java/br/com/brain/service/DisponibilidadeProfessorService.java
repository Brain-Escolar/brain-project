package br.com.brain.service;

import br.com.brain.domain.disponibilidadeProfessor.DisponibilidadeProfessor;
import br.com.brain.domain.disponibilidadeProfessor.DisponibilidadeProfessorRepository;
import br.com.brain.domain.horario.Horario;
import br.com.brain.domain.professor.Professor;
import br.com.brain.dto.disponibilidadeProfessor.AtualizacaoDisponibilidadeProfessorDto;
import br.com.brain.dto.disponibilidadeProfessor.CadastroDisponibilidadeProfessorDto;
import br.com.brain.dto.disponibilidadeProfessor.ListagemDisponibilidadeProfessorDto;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;

import lombok.RequiredArgsConstructor;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DisponibilidadeProfessorService {

    private final DisponibilidadeProfessorRepository repository;

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public List<DisponibilidadeProfessor> cadastrarDisponibilidadeProfessor(Long professorId, CadastroDisponibilidadeProfessorDto dados) {

        var disponibilidades = new ArrayList<DisponibilidadeProfessor>();
        for (var horarioId : dados.horariosId()) {
            Professor professor = em.getReference(Professor.class, professorId);
            Horario horario = em.getReference(Horario.class, horarioId);
            var disponibilidadeProfessor = new DisponibilidadeProfessor();
            disponibilidadeProfessor.setProfessor(professor);
            disponibilidadeProfessor.setHorario(horario);
            disponibilidadeProfessor.setDataVigencia(dados.dataVigencia());
            var disponibilidade = repository.save(disponibilidadeProfessor);
            disponibilidades.add(disponibilidade);
        }

        return disponibilidades;
    }

    public Page<ListagemDisponibilidadeProfessorDto> listar(Pageable paginacao, Long professorId) {
        return repository.findByProfessorId(paginacao, professorId).map(ListagemDisponibilidadeProfessorDto::new);
    }

    @Transactional
    public DisponibilidadeProfessor atualizar(AtualizacaoDisponibilidadeProfessorDto dados, Long id) {
        var nota = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("DisponibilidadeProfessor de id " + id + " não existe."));

        if (dados.horarioId() != null) {
            Horario horario = em.getReference(Horario.class, dados.horarioId());
            nota.setHorario(horario);
        }
        if (dados.dataVigencia() != null) {
            nota.setDataVigencia(dados.dataVigencia());
        }

        repository.save(nota);

        return nota;
    }

    @Transactional
    public void excluir(Long id) {
        var nota = repository
                .findById(id)
                .orElseThrow(
                        () -> new EntityNotFoundException("DisponibilidadeProfessor de id " + id + " não existe."));
        repository.delete(nota);
    }

    public DisponibilidadeProfessor detalhar(Long id) {
        return repository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("DisponibilidadeProfessor de id " + id + " não existe."));
    }
}
