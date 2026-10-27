package br.com.brain.notas;

import java.time.LocalDate;
import br.com.brain.configuracaoAcademica.AnoLetivoService;
import br.com.brain.aluno.Aluno;
import br.com.brain.aluno.AlunoRepository;
import br.com.brain.avaliacao.AvaliacaoTurma;
import br.com.brain.notas.dto.AtualizacaoNotasDto;
import br.com.brain.notas.dto.CadastroNotasDto;
import br.com.brain.notas.dto.DetalhamentoNotasAlunoDisciplinaDto;
import br.com.brain.notas.dto.ListagemNotasDto;
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
public class NotasService {

    private final NotasRepository repository;
    private final AlunoRepository alunoRepository;
    private final AnoLetivoService anoLetivoService;

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public Notas cadastrarNotas(CadastroNotasDto dados) {

        Aluno aluno = em.getReference(Aluno.class, dados.alunoId());
        AvaliacaoTurma avaliacaoTurma = em.find(AvaliacaoTurma.class, dados.avaliacaoTurmaId());
        if (avaliacaoTurma == null) {
            throw ErrosSistema.RecursoNaoEncontradoException.para("Turma da avaliação", dados.avaliacaoTurmaId());
        }
        exigirLancamentoAberto(avaliacaoTurma);
        var notas = new Notas();
        notas.setAluno(aluno);
        notas.setAvaliacaoTurma(avaliacaoTurma);
        notas.setPontuacao(dados.pontuacao());
        notas.setPeriodoReferencia(dataDeReferencia(avaliacaoTurma, dados.periodoReferencia()));

        repository.save(notas);

        return notas;
    }

    public Page<ListagemNotasDto> listar(Pageable paginacao) {
        return repository.findAll(paginacao).map(ListagemNotasDto::new);
    }

    @Transactional
    public Notas atualizar(AtualizacaoNotasDto dados, Long id) {
        var nota = repository.findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Nota", id));
        exigirLancamentoAberto(nota.getAvaliacaoTurma());

        if (dados.alunoId() != null) {
            Aluno aluno = em.getReference(Aluno.class, dados.alunoId());
            nota.setAluno(aluno);
        }
        if (dados.avaliacaoTurmaId() != null) {
            AvaliacaoTurma avaliacaoTurma = em.find(AvaliacaoTurma.class, dados.avaliacaoTurmaId());
            if (avaliacaoTurma == null) {
                throw ErrosSistema.RecursoNaoEncontradoException.para("Turma da avaliação", dados.avaliacaoTurmaId());
            }
            exigirLancamentoAberto(avaliacaoTurma);
            nota.setAvaliacaoTurma(avaliacaoTurma);
        }
        if (dados.pontuacao() != null) {
            nota.setPontuacao(dados.pontuacao());
        }
        if (dados.periodoReferencia() != null || dados.avaliacaoTurmaId() != null) {
            var data = dados.periodoReferencia() != null ? dados.periodoReferencia() : nota.getPeriodoReferencia();
            nota.setPeriodoReferencia(dataDeReferencia(nota.getAvaliacaoTurma(), data));
        }

        repository.save(nota);

        return nota;
    }

    @Transactional
    public void excluir(Long id) {
        var nota = repository
                .findById(id)
                .orElseThrow(
                        () -> ErrosSistema.RecursoNaoEncontradoException.para("Nota", id));
        exigirLancamentoAberto(nota.getAvaliacaoTurma());
        repository.delete(nota);
    }

    /** Nota de ano encerrado ou de período fechado é definitiva. */
    private void exigirLancamentoAberto(AvaliacaoTurma avaliacaoTurma) {
        anoLetivoService.exigirEditavel(avaliacaoTurma.getTurma().getAnoLetivo());
        anoLetivoService.exigirPeriodoAberto(avaliacaoTurma.getPeriodoLetivo());
    }

    /** Dentro do período da avaliação, quando ela tem um (ver V115). */
    private static LocalDate dataDeReferencia(AvaliacaoTurma avaliacaoTurma, LocalDate data) {
        var periodo = avaliacaoTurma.getPeriodoLetivo();
        return periodo != null ? periodo.trazerParaDentro(data) : data;
    }

    public Notas detalhar(Long id) {
        return repository
                .findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Nota", id));
    }

    public DetalhamentoNotasAlunoDisciplinaDto buscarNotasAlunoPorDisciplina(Long alunoId, Long disciplinaId) {
        var aluno = alunoRepository.findById(alunoId)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Aluno", alunoId));
        var notas = repository.findByAlunoIdAndAvaliacaoTurmaAvaliacaoDisciplinaIdAndAvaliacaoTurmaTurmaAnoLetivo(
                alunoId, disciplinaId, anoLetivoService.anoCorrente());
        return new DetalhamentoNotasAlunoDisciplinaDto(aluno, notas);
    }
}
