package br.com.brain.service;

import br.com.brain.domain.serie.Serie;
import br.com.brain.domain.turma.Turma;
import br.com.brain.domain.turma.TurmaRepository;
import br.com.brain.domain.unidade.Unidade;
import br.com.brain.dto.turma.AtualizacaoTurmaDto;
import br.com.brain.dto.turma.CadastroTurmaDto;
import br.com.brain.dto.turma.ListagemTurmaDto;
import br.com.brain.enums.Turno;
import br.com.brain.exception.ErrosSistema;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TurmaService {

    private final TurmaRepository repository;

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public Turma cadastrarTurma(CadastroTurmaDto dados) {

        Serie serie = em.find(Serie.class, dados.serieId());
        Unidade unidade = em.find(Unidade.class, dados.unidadeId());

        var turma = new Turma();
        turma.setNome(dados.nome());
        turma.setAnoLetivo(dados.anoLetivo());
        turma.setSerie(serie);
        turma.setTurno(Turno.valueOf(dados.turno().toUpperCase()));
        turma.setUnidade(unidade);
        turma.setVagas(dados.vagas());
        turma.setSala(dados.sala());

        repository.save(turma);

        return turma;
    }

    public Page<ListagemTurmaDto> listar(Pageable paginacao) {
        return repository.findAll(paginacao).map(ListagemTurmaDto::new);
    }

    @Transactional
    public Turma atualizar(Long id, AtualizacaoTurmaDto dados) {
        var turma = repository
                .findById(id)
                .orElseThrow(
                        () -> ErrosSistema.RecursoNaoEncontradoException.para("Turma", id));

        if (dados.nome() != null) {
            turma.setNome(dados.nome());
        }
        if (dados.sala() != null) {
            turma.setSala(dados.sala());
        }
        repository.save(turma);

        return turma;
    }

    @Transactional
    public void excluir(Long id) {
        var turma = repository
                .findById(id)
                .orElseThrow(
                        () -> ErrosSistema.RecursoNaoEncontradoException.para("Turma", id));
        repository.delete(turma);
    }

    public Turma detalhar(Long id) {
        return repository
                .findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Turma", id));
    }
}
