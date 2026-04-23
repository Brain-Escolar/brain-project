package br.com.brain.comunicado.services;

import br.com.brain.comunicado.domain.Comunicado;
import br.com.brain.comunicado.domain.ComunicadoRepository;
import br.com.brain.comunicado.dtos.AtualizacaoComunicadoDto;
import br.com.brain.comunicado.dtos.CadastroComunicadoDto;
import br.com.brain.comunicado.dtos.ListagemComunicadoDto;
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
public class ComunicadoService {

    private final ComunicadoRepository repository;

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public Comunicado cadastrarComunicado(CadastroComunicadoDto dados) {

        var comunicado = new Comunicado();
        comunicado.setTitulo(dados.titulo());
        comunicado.setConteudo(dados.conteudo());
        comunicado.setData(dados.data());

        repository.save(comunicado);

        return comunicado;
    }

    public Page<ListagemComunicadoDto> listar(Pageable paginacao) {
        return repository.findAll(paginacao).map(ListagemComunicadoDto::new);
    }

    @Transactional
    public Comunicado atualizar(AtualizacaoComunicadoDto dados, Long id) {
        var comunicado = repository.findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Comunicado", id));

        if (dados.titulo() != null) {
            comunicado.setTitulo(dados.titulo());
        }
        if (dados.conteudo() != null) {
            comunicado.setConteudo(dados.conteudo());
        }
        if (dados.data() != null) {
            comunicado.setData(dados.data());
        }

        repository.save(comunicado);

        return comunicado;
    }

    @Transactional
    public void excluir(Long id) {
        var comunicado = repository
                .findById(id)
                .orElseThrow(
                        () -> ErrosSistema.RecursoNaoEncontradoException.para("Comunicado", id));
        repository.delete(comunicado);
    }

    public Comunicado detalhar(Long id) {
        return repository
                .findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Comunicado", id));
    }
}
