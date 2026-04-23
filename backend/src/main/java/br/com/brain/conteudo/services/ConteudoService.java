package br.com.brain.conteudo.services;

import br.com.brain.aula.domain.Aula;
import br.com.brain.conteudo.domain.Conteudo;
import br.com.brain.conteudo.domain.ConteudoRepository;
import br.com.brain.conteudo.dtos.AtualizacaoConteudoDto;
import br.com.brain.conteudo.dtos.CadastroConteudoDto;
import br.com.brain.conteudo.dtos.ListagemConteudoDto;
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
public class ConteudoService {

    private final ConteudoRepository repository;

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public Conteudo cadastrarConteudo(CadastroConteudoDto dados) {

        var conteudo = new Conteudo();
        var aula = em.getReference(Aula.class, dados.aulaId());
        conteudo.setAula(aula);
        conteudo.setConteudo(dados.conteudo());
        conteudo.setData(dados.data());

        repository.save(conteudo);

        return conteudo;
    }

    public Page<ListagemConteudoDto> listar(Pageable paginacao) {
        return repository.findAll(paginacao).map(ListagemConteudoDto::new);
    }

    @Transactional
    public Conteudo atualizar(AtualizacaoConteudoDto dados, Long id) {
        var conteudo = repository
                .findById(id)
                .orElseThrow(
                        () -> ErrosSistema.RecursoNaoEncontradoException.para("Conteudo", id));

        if (dados.conteudo() != null) {
            conteudo.setConteudo(dados.conteudo());
        }
        if (dados.data() != null) {
            conteudo.setData(dados.data());
        }
        if (dados.aulaId() != null) {
            var aula = em.getReference(Aula.class, dados.aulaId());
            conteudo.setAula(aula);
        }
        repository.save(conteudo);

        return conteudo;
    }

    @Transactional
    public void excluir(Long id) {
        var conteudo = repository
                .findById(id)
                .orElseThrow(
                        () -> ErrosSistema.RecursoNaoEncontradoException.para("Conteudo", id));
        repository.delete(conteudo);
    }

    public Conteudo detalhar(Long id) {
        return repository
                .findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Conteudo", id));
    }
}
