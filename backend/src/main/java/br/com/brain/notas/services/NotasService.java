package br.com.brain.notas.services;

import br.com.brain.aluno.domain.Aluno;
import br.com.brain.aluno.domain.AlunoRepository;
import br.com.brain.avaliacao.domain.Avaliacao;
import br.com.brain.notas.domain.Notas;
import br.com.brain.notas.domain.NotasRepository;
import br.com.brain.notas.dtos.AtualizacaoNotasDto;
import br.com.brain.notas.dtos.CadastroNotasDto;
import br.com.brain.notas.dtos.DetalhamentoNotasAlunoDisciplinaDto;
import br.com.brain.notas.dtos.ListagemNotasDto;
import br.com.brain.shared.exception.ErrosSistema;
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
        Avaliacao avaliacao = em.getReference(Avaliacao.class, dados.avaliacaoId());
        var notas = new Notas();
        notas.setAluno(aluno);
        notas.setAvaliacao(avaliacao);
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
        if (dados.avaliacaoId() != null) {
            Avaliacao avaliacao = em.getReference(Avaliacao.class, dados.avaliacaoId());
            nota.setAvaliacao(avaliacao);
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
        var notas = repository.findByAlunoIdAndAvaliacaoDisciplinaId(alunoId, disciplinaId);
        return new DetalhamentoNotasAlunoDisciplinaDto(aluno, notas);
    }
}
