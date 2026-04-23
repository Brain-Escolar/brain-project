package br.com.brain.avaliacao.services;

import br.com.brain.aluno.domain.AlunoRepository;
import br.com.brain.avaliacao.domain.Avaliacao;
import br.com.brain.avaliacao.domain.AvaliacaoRepository;
import br.com.brain.disciplina.domain.Disciplina;
import br.com.brain.evento.domain.Evento;
import br.com.brain.evento.domain.EventoRepository;
import br.com.brain.notas.domain.Notas;
import br.com.brain.notas.domain.NotasRepository;
import br.com.brain.professor.domain.Professor;
import br.com.brain.turma.domain.Turma;
import br.com.brain.shared.enums.TipoEvento;
import br.com.brain.avaliacao.dtos.AtualizacaoAvaliacaoDto;
import br.com.brain.avaliacao.dtos.CadastroAvaliacaoDto;
import br.com.brain.avaliacao.dtos.CadastroNotasAvaliacaoDto;
import br.com.brain.aluno.dtos.NomeAlunoDto;
import br.com.brain.avaliacao.dtos.ListagemAvaliacaoDto;
import br.com.brain.shared.exception.ErrosSistema;

import java.util.List;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AvaliacaoService {

    private final AvaliacaoRepository repository;
    private final EventoRepository eventoRepository;
    private final AlunoRepository alunoRepository;
    private final NotasRepository notasRepository;

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public Avaliacao cadastrarAvaliacao(CadastroAvaliacaoDto dados) {

        Disciplina disciplina = em.getReference(Disciplina.class, dados.disciplinaId());
        Professor professor = em.find(Professor.class, dados.professorId());
        Turma turma = em.getReference(Turma.class, dados.turmaId());
        var avaliacao = new Avaliacao();
        avaliacao.setNome(dados.nome());
        avaliacao.setDisciplina(disciplina);
        avaliacao.setProfessor(professor);
        avaliacao.setTurma(turma);
        avaliacao.setNotaMaxima(dados.notaMaxima());
        avaliacao.setConteudo(dados.conteudo());
        avaliacao.setDataAplicacao(dados.dataAplicacao());
        if (dados.notaExtra() != null) {
            avaliacao.setNotaExtra(dados.notaExtra());
        }
        if (dados.dataEntregaNotas() != null) {
            avaliacao.setDataEntregaNotas(dados.dataEntregaNotas());
            var evento = criarEventoEntregaNotas(avaliacao, professor, dados.dataEntregaNotas());
            avaliacao.setEvento(evento);
        }

        repository.save(avaliacao);

        return avaliacao;
    }

    public Page<ListagemAvaliacaoDto> listar(Pageable paginacao) {
        return repository.findAll(paginacao).map(ListagemAvaliacaoDto::new);
    }

    @Transactional
    public Avaliacao atualizar(AtualizacaoAvaliacaoDto dados, Long id) {
        var avaliacao = repository.findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Avaliação", id));

        if (dados.nome() != null) {
            avaliacao.setNome(dados.nome());
        }
        if (dados.disciplinaId() != null) {
            Disciplina disciplina = em.getReference(Disciplina.class, dados.disciplinaId());
            avaliacao.setDisciplina(disciplina);
        }
        if (dados.turmaId() != null) {
            avaliacao.setTurma(em.getReference(Turma.class, dados.turmaId()));
        }
        if (dados.dataAplicacao() != null) {
            avaliacao.setDataAplicacao(dados.dataAplicacao());
        }
        if (dados.notaMaxima() != null) {
            avaliacao.setNotaMaxima(dados.notaMaxima());
        }
        if (dados.conteudo() != null) {
            avaliacao.setConteudo(dados.conteudo());
        }
        if (dados.notaExtra() != null) {
            avaliacao.setNotaExtra(dados.notaExtra());
        }
        if (dados.dataEntregaNotas() != null) {
            avaliacao.setDataEntregaNotas(dados.dataEntregaNotas());
            if (avaliacao.getEvento() != null) {
                avaliacao.getEvento().setDataEvento(dados.dataEntregaNotas());
                eventoRepository.save(avaliacao.getEvento());
            } else {
                var evento = criarEventoEntregaNotas(avaliacao, avaliacao.getProfessor(), dados.dataEntregaNotas());
                avaliacao.setEvento(evento);
            }
        }
        repository.save(avaliacao);

        return avaliacao;
    }

    @Transactional
    public void excluir(Long id) {
        var avaliacao = repository.findById(id).get();
        repository.delete(avaliacao);
    }

    public Avaliacao detalhar(Long id) {
        return repository.findById(id).get();
    }

    public Page<ListagemAvaliacaoDto> listarPorProfessor(Long professorId, Pageable paginacao) {
        return repository.findByProfessorId(professorId, paginacao).map(avaliacao -> {
            long totalAlunos = avaliacao.getTurma() != null
                    ? alunoRepository.countByTurmaIdAndMatriculadoTrue(avaliacao.getTurma().getId())
                    : 0L;
            long alunosCorrigidos = notasRepository.countByAvaliacaoId(avaliacao.getId());
            return new ListagemAvaliacaoDto(avaliacao, totalAlunos, alunosCorrigidos);
        });
    }

    public List<NomeAlunoDto> recuperarAlunosPorAvaliacao(Long avaliacaoId) {
        var avaliacao = repository.findById(avaliacaoId)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Avaliação", avaliacaoId));

        if (avaliacao.getTurma() == null) {
            return List.of();
        }

        return alunoRepository.findByTurmaIdAndMatriculadoTrue(avaliacao.getTurma().getId())
                .stream()
                .map(NomeAlunoDto::new)
                .toList();
    }

    @Transactional
    public void cadastrarNotasDeUmaAvaliacao(Long avaliacaoId, CadastroNotasAvaliacaoDto dados) {
        var avaliacao = repository.findById(avaliacaoId)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Avaliação", avaliacaoId));

        var notas = dados.notas().stream().map(notaDto -> {
            var nota = new Notas();
            nota.setAvaliacao(avaliacao);
            nota.setAluno(em.getReference(br.com.brain.aluno.domain.Aluno.class, notaDto.alunoId()));
            nota.setPontuacao(notaDto.pontuacao());
            nota.setPeriodoReferencia(dados.periodoReferencia());
            return nota;
        }).toList();

        notasRepository.saveAll(notas);
    }

    private Evento criarEventoEntregaNotas(Avaliacao avaliacao, Professor professor, java.time.LocalDate dataEntregaNotas) {
        var evento = new Evento();
        evento.setTitulo("Entrega de notas: " + avaliacao.getNome());
        evento.setDescricao("Prazo para lançamento de notas da avaliação \"" + avaliacao.getNome() + "\"");
        evento.setDataEvento(dataEntregaNotas);
        evento.setTipo(TipoEvento.ENTREGA_NOTAS);
        evento.setProfessor(professor);
        evento.setAvaliacao(avaliacao);
        eventoRepository.save(evento);
        return evento;
    }
}
