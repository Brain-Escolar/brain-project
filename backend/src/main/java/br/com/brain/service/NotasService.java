package br.com.brain.service;

import br.com.brain.domain.aluno.Aluno;
import br.com.brain.domain.avaliacao.Avaliacao;
import br.com.brain.domain.notas.Notas;
import br.com.brain.domain.notas.NotasRepository;
import br.com.brain.dto.notas.AtualizacaoNotasDto;
import br.com.brain.dto.notas.CadastroNotasDto;
import br.com.brain.dto.notas.ListagemNotasDto;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
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
                .orElseThrow(() -> new EntityNotFoundException("Nota de id " + id + " não existe."));

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
                        () -> new EntityNotFoundException("Nota de id " + id + " não existe."));
        repository.delete(nota);
    }

    public Notas detalhar(Long id) {
        return repository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Nota de id " + id + " não existe."));
    }
}
