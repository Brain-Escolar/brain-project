package br.com.brain.turma.services;

import br.com.brain.serie.domain.Serie;
import br.com.brain.turma.domain.Turma;
import br.com.brain.turma.domain.TurmaRepository;
import br.com.brain.unidade.domain.Unidade;
import br.com.brain.aluno.dtos.ListagemAlunoDto;
import br.com.brain.turma.dtos.AtualizacaoTurmaDto;
import br.com.brain.turma.dtos.CadastroTurmaDto;
import br.com.brain.turma.dtos.ListagemTurmaDto;
import br.com.brain.shared.enums.Turno;
import br.com.brain.shared.exception.ErrosSistema;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import java.util.List;
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

    public List<ListagemAlunoDto> listarAlunos(Long id) {
        var turma = repository
                .findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Turma", id));
        return turma.getAlunos().stream().map(ListagemAlunoDto::new).toList();
    }
}
