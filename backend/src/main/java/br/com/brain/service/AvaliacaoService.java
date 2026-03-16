package br.com.brain.service;

import br.com.brain.domain.avaliacao.Avaliacao;
import br.com.brain.domain.avaliacao.AvaliacaoRepository;
import br.com.brain.domain.disciplina.Disciplina;
import br.com.brain.dto.avaliacao.AtualizacaoAvaliacaoDto;
import br.com.brain.dto.avaliacao.CadastroAvaliacaoDto;
import br.com.brain.dto.avaliacao.ListagemAvaliacaoDto;
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
public class AvaliacaoService {

    private final AvaliacaoRepository repository;

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public Avaliacao cadastrarAvaliacao(CadastroAvaliacaoDto dados) {

        Disciplina disciplina = em.getReference(Disciplina.class, dados.disciplinaId());
        var avaliacao = new Avaliacao();
        avaliacao.setNome(dados.nome());
        avaliacao.setDisciplina(disciplina);
        avaliacao.setPeso(dados.peso());
        avaliacao.setConteudo(dados.conteudo());
        if (dados.notaExtra() != null) {
            avaliacao.setNotaExtra(dados.notaExtra());
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
                .orElseThrow(() -> new EntityNotFoundException("Avaliacao de id " + id + " não existe."));

        if (dados.nome() != null) {
            avaliacao.setNome(dados.nome());
        }
        if (dados.disciplinaId() != null) {
            Disciplina disciplina = em.getReference(Disciplina.class, dados.disciplinaId());
            avaliacao.setDisciplina(disciplina);
        }
        if (dados.peso() != null) {
            avaliacao.setPeso(dados.peso());
        }
        if (dados.conteudo() != null) {
            avaliacao.setConteudo(dados.conteudo());
        }
        if (dados.notaExtra() != null) {
            avaliacao.setNotaExtra(dados.notaExtra());
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
}
