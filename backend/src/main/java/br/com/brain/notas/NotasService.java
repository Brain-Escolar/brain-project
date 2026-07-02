package br.com.brain.notas;

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

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public Notas cadastrarNotas(CadastroNotasDto dados) {

        Aluno aluno = em.getReference(Aluno.class, dados.alunoId());
        AvaliacaoTurma avaliacaoTurma = em.getReference(AvaliacaoTurma.class, dados.avaliacaoTurmaId());
        var notas = new Notas();
        notas.setAluno(aluno);
        notas.setAvaliacaoTurma(avaliacaoTurma);
        notas.setPontuacao(dados.pontuacao());
        notas.setPeriodoReferencia(dados.periodoReferencia());

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

        if (dados.alunoId() != null) {
            Aluno aluno = em.getReference(Aluno.class, dados.alunoId());
            nota.setAluno(aluno);
        }
        if (dados.avaliacaoTurmaId() != null) {
            AvaliacaoTurma avaliacaoTurma = em.getReference(AvaliacaoTurma.class, dados.avaliacaoTurmaId());
            nota.setAvaliacaoTurma(avaliacaoTurma);
        }
        if (dados.pontuacao() != null) {
            nota.setPontuacao(dados.pontuacao());
        }
        if (dados.periodoReferencia() != null) {
            nota.setPeriodoReferencia(dados.periodoReferencia());
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
        repository.delete(nota);
    }

    public Notas detalhar(Long id) {
        return repository
                .findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Nota", id));
    }

    public DetalhamentoNotasAlunoDisciplinaDto buscarNotasAlunoPorDisciplina(Long alunoId, Long disciplinaId) {
        var aluno = alunoRepository.findById(alunoId)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Aluno", alunoId));
        var notas = repository.findByAlunoIdAndAvaliacaoTurmaAvaliacaoDisciplinaId(alunoId, disciplinaId);
        return new DetalhamentoNotasAlunoDisciplinaDto(aluno, notas);
    }
}
