package br.com.brain.service;

import br.com.brain.domain.grupo.GrupoDisciplina;
import br.com.brain.domain.grupo.GrupoDisciplinaRepository;
import br.com.brain.dto.grupo.AtualizacaoGrupoDisciplinaDto;
import br.com.brain.dto.grupo.CadastroGrupoDisciplinaDto;
import br.com.brain.dto.grupo.ListagemGrupoDisciplinaDto;
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
public class GrupoDisciplinaService {

    private final GrupoDisciplinaRepository repository;

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public GrupoDisciplina cadastrarGrupoDisciplina(CadastroGrupoDisciplinaDto dados) {

        var grupo = new GrupoDisciplina();
        grupo.setNome(dados.nome());
        grupo.setArea(dados.area());

        repository.save(grupo);

        return grupo;
    }

    public Page<ListagemGrupoDisciplinaDto> listar(Pageable paginacao) {
        return repository.findAll(paginacao).map(ListagemGrupoDisciplinaDto::new);
    }

    @Transactional
    public GrupoDisciplina atualizar(AtualizacaoGrupoDisciplinaDto dados, Long id) {
        var grupo = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("GrupoDisciplina de id " + id + " não existe."));

        if (dados.nome() != null) {
            grupo.setNome(dados.nome());
        }
        if (dados.area() != null) {
            grupo.setArea(dados.area());
        }

        repository.save(grupo);

        return grupo;
    }

    @Transactional
    public void excluir(Long id) {
        var grupo = repository.findById(id).get();
        repository.delete(grupo);
    }

    public GrupoDisciplina detalhar(Long id) {
        return repository.findById(id).get();
    }
}
