package br.com.brain.chamada;

import br.com.brain.chamada.dto.AtualizacaoChamadaDto;
import br.com.brain.chamada.dto.AtualizacaoChamadaLoteDto;
import br.com.brain.chamada.dto.CadastroChamadaDto;
import br.com.brain.chamada.dto.ListagemChamadaDto;
import br.com.brain.exception.ErrosSistema;
import br.com.brain.aluno.Aluno;
import br.com.brain.aula.Aula;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

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

        if (!repository.findAllByAulaIdAndData(dados.aulaId(), dados.data()).isEmpty()) {
            throw new ErrosSistema.RecursoJaExisteException(
                    "Chamada para a aula " + dados.aulaId() + " na data " + dados.data()
                            + " já foi registrada.");
        }

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

    public List<ListagemChamadaDto> buscarPorAulaEData(Long aulaId, LocalDate data) {
        return repository.findAllByAulaIdAndData(aulaId, data)
                .stream()
                .map(ListagemChamadaDto::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<ListagemChamadaDto> atualizarLote(Long aulaId, LocalDate data, AtualizacaoChamadaLoteDto dados) {
        var chamadas = repository.findAllByAulaIdAndData(aulaId, data);
        if (chamadas.isEmpty()) {
            throw ErrosSistema.RecursoNaoEncontradoException.para("Chamada", aulaId);
        }

        var chamadaMap = chamadas.stream()
                .collect(Collectors.toMap(c -> c.getAluno().getId(), c -> c));

        for (var presenca : dados.presencas()) {
            var chamada = chamadaMap.get(presenca.alunoId());
            if (chamada != null) {
                chamada.setPresente(presenca.presente());
                repository.save(chamada);
            }
        }

        return chamadas.stream().map(ListagemChamadaDto::new).collect(Collectors.toList());
    }

    public Integer contarFaltasPorAlunoEPorDisciplina(Long alunoId, Long disciplinaId) {
        return repository.countFaltasByAlunoAndDisciplina(alunoId, disciplinaId);
    }
}
