package br.com.brain.escolaridade;

import br.com.brain.escolaridade.dto.AtualizacaoEscolaridadeDto;
import br.com.brain.escolaridade.dto.CadastroEscolaridadeDto;
import br.com.brain.escolaridade.dto.ListagemEscolaridadeDto;
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
                        () -> ErrosSistema.RecursoNaoEncontradoException.para("Escolaridade", id));

        if (dados.descricao() != null) {
            escolaridade.setDescricao(dados.descricao());
        }
        repository.save(escolaridade);

        return escolaridade;
    }

    public Escolaridade detalhar(Long id) {
        return repository
                .findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Escolaridade", id));
    }
}
