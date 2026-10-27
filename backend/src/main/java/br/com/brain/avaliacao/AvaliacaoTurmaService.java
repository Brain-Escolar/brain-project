package br.com.brain.avaliacao;

import br.com.brain.configuracaoAcademica.AnoLetivoService;
import br.com.brain.configuracaoAcademica.PeriodoLetivo;
import br.com.brain.configuracaoAcademica.PeriodoLetivoRepository;
import br.com.brain.matricula.MatriculaRepository;
import java.time.LocalDate;
import java.util.List;

import br.com.brain.aluno.Aluno;
import br.com.brain.aluno.dto.NomeAlunoDto;
import br.com.brain.avaliacao.dto.AtualizacaoAvaliacaoTurmaDto;
import br.com.brain.avaliacao.dto.CadastroAvaliacaoTurmaDto;
import br.com.brain.avaliacao.dto.CadastroNotasAvaliacaoDto;
import br.com.brain.avaliacao.dto.ListagemAvaliacaoTurmaDto;
import br.com.brain.enums.TipoEvento;
import br.com.brain.evento.Evento;
import br.com.brain.evento.EventoRepository;
import br.com.brain.exception.ErrosSistema;
import br.com.brain.notas.Notas;
import br.com.brain.notas.NotasRepository;
import br.com.brain.professor.Professor;
import br.com.brain.turma.Turma;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AvaliacaoTurmaService {

    private final AvaliacaoTurmaRepository repository;
    private final AvaliacaoRepository avaliacaoRepository;
    private final EventoRepository eventoRepository;
    private final MatriculaRepository matriculaRepository;
    private final NotasRepository notasRepository;
    private final AnoLetivoService anoLetivoService;
    private final PeriodoLetivoRepository periodoLetivoRepository;

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public AvaliacaoTurma criarParaAvaliacao(Avaliacao avaliacao, CadastroAvaliacaoTurmaDto dados, Long professorPadraoId) {
        Long professorId = dados.professorId() != null ? dados.professorId() : professorPadraoId;

        var turma = em.find(Turma.class, dados.turmaId());
        if (turma == null) {
            throw ErrosSistema.RecursoNaoEncontradoException.para("Turma", dados.turmaId());
        }
        var periodo = resolverPeriodo(turma, dados.periodoLetivoId(), dados.dataAplicacao());
        anoLetivoService.exigirEditavel(turma.getAnoLetivo());
        anoLetivoService.exigirPeriodoAberto(periodo);

        var avaliacaoTurma = new AvaliacaoTurma();
        avaliacaoTurma.setAvaliacao(avaliacao);
        avaliacaoTurma.setTurma(turma);
        avaliacaoTurma.setProfessor(em.getReference(Professor.class, professorId));
        avaliacaoTurma.setDataAplicacao(dados.dataAplicacao());
        avaliacaoTurma.setDataEntregaNotas(dados.dataEntregaNotas());
        avaliacaoTurma.setPeriodoLetivo(periodo);

        repository.save(avaliacaoTurma);

        if (dados.dataEntregaNotas() != null) {
            var evento = criarEventoEntregaNotas(avaliacaoTurma, dados.dataEntregaNotas());
            avaliacaoTurma.setEvento(evento);
            repository.save(avaliacaoTurma);
        }

        return avaliacaoTurma;
    }

    @Transactional
    public AvaliacaoTurma adicionarTurma(Long avaliacaoId, CadastroAvaliacaoTurmaDto dados, Long professorPadraoId) {
        var avaliacao = avaliacaoRepository.findById(avaliacaoId)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Avaliação", avaliacaoId));
        return criarParaAvaliacao(avaliacao, dados, professorPadraoId);
    }

    @Transactional
    public AvaliacaoTurma atualizarDatas(Long avaliacaoTurmaId, AtualizacaoAvaliacaoTurmaDto dados) {
        var avaliacaoTurma = repository.findById(avaliacaoTurmaId)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Turma da avaliação", avaliacaoTurmaId));
        anoLetivoService.exigirEditavel(avaliacaoTurma.getTurma().getAnoLetivo());

        boolean mudaPeriodo = dados.periodoLetivoId() != null || dados.dataAplicacao() != null;
        if (mudaPeriodo) {
            var novo = resolverPeriodo(avaliacaoTurma.getTurma(), dados.periodoLetivoId(),
                    dados.dataAplicacao() != null ? dados.dataAplicacao() : avaliacaoTurma.getDataAplicacao());
            var atual = avaliacaoTurma.getPeriodoLetivo();
            if (novo != null && (atual == null || !atual.getId().equals(novo.getId()))) {
                // Mover a avaliação de período mexe nas notas dos dois: ambos precisam estar abertos.
                anoLetivoService.exigirPeriodoAberto(atual);
                anoLetivoService.exigirPeriodoAberto(novo);
                avaliacaoTurma.setPeriodoLetivo(novo);
                notasRepository.findByAvaliacaoTurmaId(avaliacaoTurmaId)
                        .forEach(n -> n.setPeriodoReferencia(novo.trazerParaDentro(n.getPeriodoReferencia())));
            }
        }

        if (dados.professorId() != null) {
            avaliacaoTurma.setProfessor(em.getReference(Professor.class, dados.professorId()));
        }
        if (dados.dataAplicacao() != null) {
            avaliacaoTurma.setDataAplicacao(dados.dataAplicacao());
        }
        if (dados.dataEntregaNotas() != null) {
            avaliacaoTurma.setDataEntregaNotas(dados.dataEntregaNotas());
            if (avaliacaoTurma.getEvento() != null) {
                avaliacaoTurma.getEvento().setDataEvento(dados.dataEntregaNotas());
                eventoRepository.save(avaliacaoTurma.getEvento());
            } else {
                var evento = criarEventoEntregaNotas(avaliacaoTurma, dados.dataEntregaNotas());
                avaliacaoTurma.setEvento(evento);
            }
        }

        repository.save(avaliacaoTurma);

        return avaliacaoTurma;
    }

    public List<AvaliacaoTurma> listarPorAvaliacao(Long avaliacaoId) {
        return repository.findByAvaliacaoId(avaliacaoId);
    }

    public List<ListagemAvaliacaoTurmaDto> listarResumoPorAvaliacao(Long avaliacaoId) {
        return repository.findByAvaliacaoId(avaliacaoId).stream()
                .map(this::construirListagem)
                .toList();
    }

    public ListagemAvaliacaoTurmaDto construirListagem(AvaliacaoTurma avaliacaoTurma) {
        long totalAlunos = matriculaRepository.countAlunosDaTurma(avaliacaoTurma.getTurma().getId());
        long alunosCorrigidos = notasRepository.countByAvaliacaoTurmaId(avaliacaoTurma.getId());
        return new ListagemAvaliacaoTurmaDto(avaliacaoTurma, totalAlunos, alunosCorrigidos);
    }

    @Transactional
    public void excluir(Long avaliacaoTurmaId) {
        var avaliacaoTurma = repository.findById(avaliacaoTurmaId)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Turma da avaliação", avaliacaoTurmaId));

        anoLetivoService.exigirPeriodoAberto(avaliacaoTurma.getPeriodoLetivo());
        if (notasRepository.countByAvaliacaoTurmaId(avaliacaoTurmaId) > 0) {
            throw ErrosSistema.OperacaoInvalidaException
                    .com("Não é possível remover uma turma que já possui notas lançadas.");
        }

        repository.delete(avaliacaoTurma);
    }

    public List<NomeAlunoDto> recuperarAlunosPorAvaliacaoTurma(Long avaliacaoTurmaId) {
        var avaliacaoTurma = repository.findById(avaliacaoTurmaId)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Turma da avaliação", avaliacaoTurmaId));

        return matriculaRepository.findAlunosDaTurma(avaliacaoTurma.getTurma().getId())
                .stream()
                .map(NomeAlunoDto::new)
                .toList();
    }

    @Transactional
    public void cadastrarNotas(Long avaliacaoTurmaId, CadastroNotasAvaliacaoDto dados) {
        var avaliacaoTurma = repository.findById(avaliacaoTurmaId)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Turma da avaliação", avaliacaoTurmaId));

        anoLetivoService.exigirEditavel(avaliacaoTurma.getTurma().getAnoLetivo());
        var periodo = avaliacaoTurma.getPeriodoLetivo();
        anoLetivoService.exigirPeriodoAberto(periodo);
        // A data de referência fica dentro do período da avaliação: é por ela que
        // boletim e relatórios põem a nota no bimestre certo.
        var referencia = periodo != null
                ? periodo.trazerParaDentro(dados.periodoReferencia())
                : dados.periodoReferencia();

        var notas = dados.notas().stream().map(notaDto -> {
            var nota = new Notas();
            nota.setAvaliacaoTurma(avaliacaoTurma);
            nota.setAluno(em.getReference(Aluno.class, notaDto.alunoId()));
            nota.setPontuacao(notaDto.pontuacao());
            nota.setPeriodoReferencia(referencia);
            return nota;
        }).toList();

        notasRepository.saveAll(notas);
    }

    /**
     * Período informado (precisa ser do ano da turma) ou, sem ele, o que contém
     * a data de aplicação — e, sem data, o período corrente.
     */
    private PeriodoLetivo resolverPeriodo(Turma turma, Long periodoLetivoId, LocalDate dataAplicacao) {
        if (periodoLetivoId != null) {
            var periodo = periodoLetivoRepository.findById(periodoLetivoId)
                    .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Período letivo", periodoLetivoId));
            if (periodo.getAnoLetivo() != turma.getAnoLetivo()) {
                throw ErrosSistema.OperacaoInvalidaException.com(
                        "O período escolhido é de " + periodo.getAnoLetivo() + ", e a turma é de "
                                + turma.getAnoLetivo() + ".");
            }
            return periodo;
        }
        return anoLetivoService.periodoPara(turma.getAnoLetivo(), dataAplicacao);
    }

    private Evento criarEventoEntregaNotas(AvaliacaoTurma avaliacaoTurma, LocalDate dataEntregaNotas) {
        var avaliacao = avaliacaoTurma.getAvaliacao();
        var evento = new Evento();
        evento.setTitulo("Entrega de notas: " + avaliacao.getNome());
        evento.setDescricao("Prazo para lançamento de notas da avaliação \"" + avaliacao.getNome() + "\"");
        evento.setDataEvento(dataEntregaNotas);
        evento.setTipo(TipoEvento.ENTREGA_NOTAS);
        evento.setProfessor(avaliacaoTurma.getProfessor());
        evento.setAvaliacaoTurma(avaliacaoTurma);
        eventoRepository.save(evento);
        return evento;
    }
}
