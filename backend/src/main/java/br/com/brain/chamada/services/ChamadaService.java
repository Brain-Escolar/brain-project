package br.com.brain.chamada.services;

import br.com.brain.chamada.dtos.AtualizacaoChamadaDto;
import br.com.brain.chamada.dtos.CadastroChamadaDto;
import br.com.brain.chamada.dtos.ListagemChamadaDto;
import br.com.brain.shared.exception.ErrosSistema;
import br.com.brain.aluno.domain.Aluno;
import br.com.brain.aula.domain.Aula;
import br.com.brain.chamada.domain.Chamada;
import br.com.brain.chamada.domain.ChamadaRepository;
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
public class ChamadaService {

    private final ChamadaRepository repository;

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public List<ListagemChamadaDto> cadastrarChamada(CadastroChamadaDto dados) {

        repository.findByAulaIdAndData(dados.aulaId(), dados.data()).ifPresent(_ -> {
            throw new ErrosSistema.RecursoJaExisteException(
                    "Chamada para a aula " + dados.aulaId() + " na data " + dados.data()
                            + " já foi registrada.");
        });

        var listagemChamadaDtos = new ArrayList<ListagemChamadaDto>();

        for (var presenca : dados.presencas()) {
            var chamada = new Chamada();
            Aluno aluno = em.getReference(Aluno.class, presenca.alunoId());
            Aula aula = em.getReference(Aula.class, dados.aulaId());
            chamada.setAluno(aluno);
            chamada.setAula(aula);
            chamada.setData(dados.data());
            chamada.setPresente(presenca.presente());
            var listagemChamadaDto = new ListagemChamadaDto(chamada);
            listagemChamadaDtos.add(listagemChamadaDto);
            repository.save(chamada);
        }
        return listagemChamadaDtos;
    }

    public Page<ListagemChamadaDto> listar(Pageable paginacao) {
        return repository.findAll(paginacao).map(ListagemChamadaDto::new);
    }

    @Transactional
    public Chamada atualizar(AtualizacaoChamadaDto dados, Long id) {
        var chamada = repository
                .findById(id)
                .orElseThrow(
                        () -> ErrosSistema.RecursoNaoEncontradoException.para("Chamada", id));

        if (dados.presente() != null) {
            chamada.setPresente(dados.presente());
        }
        if (dados.alunoId() != null) {
            Aluno aluno = em.getReference(Aluno.class, dados.alunoId());
            chamada.setAluno(aluno);
        }
        if (dados.aulaId() != null) {
            Aula aula = em.getReference(Aula.class, dados.aulaId());
            chamada.setAula(aula);
        }
        if (dados.data() != null) {
            chamada.setData(dados.data());
        }

        repository.save(chamada);

        return chamada;
    }

    @Transactional
    public void excluir(Long id) {
        var chamada = repository
                .findById(id)
                .orElseThrow(
                        () -> ErrosSistema.RecursoNaoEncontradoException.para("Chamada", id));
        repository.delete(chamada);
    }

    public Chamada detalhar(Long id) {
        return repository
                .findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Chamada", id));
    }

    public Integer contarFaltasPorAlunoEPorDisciplina(Long alunoId, Long disciplinaId) {
        return repository.countFaltasByAlunoAndDisciplina(alunoId, disciplinaId);
    }
}
