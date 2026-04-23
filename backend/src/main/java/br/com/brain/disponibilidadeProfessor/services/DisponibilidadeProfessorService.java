package br.com.brain.disponibilidadeProfessor.services;

import br.com.brain.disponibilidadeProfessor.domain.DisponibilidadeProfessor;
import br.com.brain.disponibilidadeProfessor.domain.DisponibilidadeProfessorRepository;
import br.com.brain.horario.domain.Horario;
import br.com.brain.professor.domain.Professor;
import br.com.brain.disponibilidadeProfessor.dtos.AtualizacaoDisponibilidadeProfessorDto;
import br.com.brain.disponibilidadeProfessor.dtos.CadastroDisponibilidadeProfessorDto;
import br.com.brain.disponibilidadeProfessor.dtos.ListagemDisponibilidadeProfessorDto;
import br.com.brain.shared.exception.ErrosSistema;
import jakarta.persistence.EntityManager;
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
    public List<DisponibilidadeProfessor> cadastrarDisponibilidadeProfessor(Long professorId,
            CadastroDisponibilidadeProfessorDto dados) {

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
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("DisponibilidadeProfessor", id));

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
                        () -> ErrosSistema.RecursoNaoEncontradoException.para("DisponibilidadeProfessor", id));
        repository.delete(nota);
    }

    public DisponibilidadeProfessor detalhar(Long id) {
        return repository
                .findById(id)
                .orElseThrow(
                        () -> ErrosSistema.RecursoNaoEncontradoException.para("DisponibilidadeProfessor", id));
    }
}
