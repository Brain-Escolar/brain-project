package br.com.brain.service;

import br.com.brain.domain.serie.Serie;
import br.com.brain.domain.serie.SerieRepository;
import br.com.brain.dto.serie.AtualizacaoSerieDto;
import br.com.brain.dto.serie.CadastroSerieDto;
import br.com.brain.dto.serie.ListagemSerieDto;
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
public class SerieService {

    private final SerieRepository repository;

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public Serie cadastrarSerie(CadastroSerieDto dados) {

        var serie = new Serie();
        serie.setNome(dados.nome());

        repository.save(serie);

        return serie;
    }

    public Page<ListagemSerieDto> listar(Pageable paginacao) {
        return repository.findAll(paginacao).map(ListagemSerieDto::new);
    }

    @Transactional
    public Serie atualizar(Long id, AtualizacaoSerieDto dados) {
        var serie = repository
                .findById(id)
                .orElseThrow(
                        () -> new EntityNotFoundException("Serie de id " + id + " não existe."));

        if (dados.nome() != null) {
            serie.setNome(dados.nome());
        }
        repository.save(serie);

        return serie;
    }

    @Transactional
    public void excluir(Long id) {
        var serie = repository
                .findById(id)
                .orElseThrow(
                        () -> new EntityNotFoundException("Serie de id " + id + " não existe."));
        repository.delete(serie);
    }

    public Serie detalhar(Long id) {
        return repository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Serie de id " + id + " não existe."));
    }
}
