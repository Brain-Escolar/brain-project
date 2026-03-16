package br.com.brain.service;

import br.com.brain.domain.escolaridade.Escolaridade;
import br.com.brain.domain.escolaridade.EscolaridadeRepository;
import br.com.brain.dto.escolaridade.AtualizacaoEscolaridadeDto;
import br.com.brain.dto.escolaridade.CadastroEscolaridadeDto;
import br.com.brain.dto.escolaridade.ListagemEscolaridadeDto;
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
public class EscolaridadeService {

    private final EscolaridadeRepository repository;

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public Escolaridade cadastrarEscolaridade(CadastroEscolaridadeDto dados) {

        var escolaridade = new Escolaridade();
        escolaridade.setDescricao(dados.descricao());

        repository.save(escolaridade);

        return escolaridade;
    }

    public Page<ListagemEscolaridadeDto> listar(Pageable paginacao) {
        return repository.findAll(paginacao).map(ListagemEscolaridadeDto::new);
    }

    @Transactional
    public Escolaridade atualizar(Long id, AtualizacaoEscolaridadeDto dados) {
        var escolaridade = repository
                .findById(id)
                .orElseThrow(
                        () -> new EntityNotFoundException("Escolaridade de id " + id + " não existe."));

        if (dados.descricao() != null) {
            escolaridade.setDescricao(dados.descricao());
        }
        repository.save(escolaridade);

        return escolaridade;
    }

    public Escolaridade detalhar(Long id) {
        return repository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Escolaridade de id " + id + " não existe."));
    }
}
