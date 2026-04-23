package br.com.brain.unidade.services;

import br.com.brain.unidade.domain.Unidade;
import br.com.brain.unidade.domain.UnidadeRepository;
import br.com.brain.unidade.dtos.AtualizacaoUnidadeDto;
import br.com.brain.unidade.dtos.CadastroUnidadeDto;
import br.com.brain.unidade.dtos.ListagemUnidadeDto;
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
public class UnidadeService {

    private final UnidadeRepository repository;

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public Unidade cadastrarUnidade(CadastroUnidadeDto dados) {

        var unidade = new Unidade();
        unidade.setNome(dados.nome());

        repository.save(unidade);

        return unidade;
    }

    public Page<ListagemUnidadeDto> listar(Pageable paginacao) {
        return repository.findAll(paginacao).map(ListagemUnidadeDto::new);
    }

    @Transactional
    public Unidade atualizar(Long id, AtualizacaoUnidadeDto dados) {
        var unidade = repository
                .findById(id)
                .orElseThrow(
                        () -> ErrosSistema.RecursoNaoEncontradoException.para("Unidade", id));

        if (dados.nome() != null) {
            unidade.setNome(dados.nome());
        }
        repository.save(unidade);

        return unidade;
    }

    @Transactional
    public void excluir(Long id) {
        var unidade = repository
                .findById(id)
                .orElseThrow(
                        () -> ErrosSistema.RecursoNaoEncontradoException.para("Unidade", id));
        repository.delete(unidade);
    }

    public Unidade detalhar(Long id) {
        return repository
                .findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Unidade", id));
    }
}
