package br.com.brain.service;

import br.com.brain.domain.avaliacao.Avaliacao;
import br.com.brain.domain.evento.Evento;
import br.com.brain.domain.evento.EventoRepository;
import br.com.brain.domain.professor.Professor;
import br.com.brain.domain.serie.Serie;
import br.com.brain.domain.turma.Turma;
import br.com.brain.domain.unidade.Unidade;
import br.com.brain.dto.evento.AtualizacaoEventoDto;
import br.com.brain.dto.evento.CadastroEventoDto;
import br.com.brain.dto.evento.DetalhamentoEventoDto;
import br.com.brain.dto.evento.ListagemEventoDto;
import br.com.brain.exception.ErrosSistema;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EventoService {

    private final EventoRepository repository;

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public Evento cadastrar(CadastroEventoDto dados) {
        var evento = new Evento();
        evento.setTitulo(dados.titulo());
        evento.setDescricao(dados.descricao());
        evento.setDataEvento(dados.dataEvento());
        evento.setTipo(dados.tipo());

        if (dados.turmaId() != null) {
            evento.setTurma(em.getReference(Turma.class, dados.turmaId()));
        }
        if (dados.serieId() != null) {
            evento.setSerie(em.getReference(Serie.class, dados.serieId()));
        }
        if (dados.unidadeId() != null) {
            evento.setUnidade(em.getReference(Unidade.class, dados.unidadeId()));
        }
        if (dados.professorId() != null) {
            evento.setProfessor(em.getReference(Professor.class, dados.professorId()));
        }
        if (dados.avaliacaoId() != null) {
            evento.setAvaliacao(em.getReference(Avaliacao.class, dados.avaliacaoId()));
        }

        repository.save(evento);
        return evento;
    }

    public Page<ListagemEventoDto> listarEventosProfessor(Long professorId, Pageable pageable) {
        return repository.findAllByProfessorId(professorId, pageable).map(ListagemEventoDto::new);
    }

    public Page<ListagemEventoDto> listar(Long turmaId, Long serieId, Long unidadeId, Long professorId,
            Pageable pageable) {
        if (turmaId != null) {
            return repository.findAllByTurmaId(turmaId, pageable).map(ListagemEventoDto::new);
        }
        if (serieId != null) {
            return repository.findAllBySerieId(serieId, pageable).map(ListagemEventoDto::new);
        }
        if (unidadeId != null) {
            return repository.findAllByUnidadeId(unidadeId, pageable).map(ListagemEventoDto::new);
        }
        if (professorId != null) {
            return repository.findAllByProfessorId(professorId, pageable).map(ListagemEventoDto::new);
        }
        return repository.findAllOrderByClosestDate(pageable).map(ListagemEventoDto::new);
    }

    @Transactional
    public Evento atualizar(AtualizacaoEventoDto dados, Long id) {
        var evento = repository.findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Evento", id));

        if (dados.titulo() != null) {
            evento.setTitulo(dados.titulo());
        }
        if (dados.descricao() != null) {
            evento.setDescricao(dados.descricao());
        }
        if (dados.dataEvento() != null) {
            evento.setDataEvento(dados.dataEvento());
        }
        if (dados.tipo() != null) {
            evento.setTipo(dados.tipo());
        }
        if (dados.turmaId() != null) {
            evento.setTurma(em.getReference(Turma.class, dados.turmaId()));
        }
        if (dados.serieId() != null) {
            evento.setSerie(em.getReference(Serie.class, dados.serieId()));
        }
        if (dados.unidadeId() != null) {
            evento.setUnidade(em.getReference(Unidade.class, dados.unidadeId()));
        }
        if (dados.professorId() != null) {
            evento.setProfessor(em.getReference(Professor.class, dados.professorId()));
        }
        if (dados.avaliacaoId() != null) {
            evento.setAvaliacao(em.getReference(Avaliacao.class, dados.avaliacaoId()));
        }

        repository.save(evento);
        return evento;
    }

    @Transactional
    public void excluir(Long id) {
        var evento = repository.findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Evento", id));
        repository.delete(evento);
    }

    public DetalhamentoEventoDto detalhar(Long id) {
        var evento = repository.findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Evento", id));
        return new DetalhamentoEventoDto(evento);
    }
}
