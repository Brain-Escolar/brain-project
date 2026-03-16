package br.com.brain.service;

import br.com.brain.domain.disciplina.Disciplina;
import br.com.brain.domain.disciplina.DisciplinaRepository;
import br.com.brain.domain.grupo.GrupoDisciplina;
import br.com.brain.domain.serie.Serie;
import br.com.brain.dto.disciplina.AtualizacaoDisciplinaDto;
import br.com.brain.dto.disciplina.CadastroDisciplinaDto;
import br.com.brain.dto.disciplina.ListagemDisciplinaDto;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DisciplinaService {

    private final DisciplinaRepository repository;

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public Disciplina cadastrarDisciplina(CadastroDisciplinaDto dados) {

        GrupoDisciplina grupo = em.getReference(GrupoDisciplina.class, dados.grupoId());
        Serie serie = em.getReference(Serie.class, dados.serieId());

        var disciplina = new Disciplina();
        disciplina.setNome(dados.nome());
        disciplina.setCargaHoraria(dados.cargaHoraria());
        disciplina.setGrupo(grupo);
        disciplina.setSerie(serie);

        repository.save(disciplina);

        return disciplina;
    }

    public Page<ListagemDisciplinaDto> listar(Pageable paginacao) {
        return repository.findAll(paginacao).map(ListagemDisciplinaDto::new);
    }

    @Transactional
    public Disciplina atualizar(AtualizacaoDisciplinaDto dados, Long id) {
        var disciplina = repository.findById(id).get();

        if (dados.nome() != null) {
            disciplina.setNome(dados.nome());
        }
        if (dados.serieId() != null) {
            Serie serie = em.getReference(Serie.class, dados.serieId());
            disciplina.setSerie(serie);
        }
        if (dados.cargaHoraria() != 0) {
            disciplina.setCargaHoraria(dados.cargaHoraria());
        }
        if (dados.grupoId() != null) {
            GrupoDisciplina grupo = em.getReference(GrupoDisciplina.class, dados.grupoId());
            disciplina.setGrupo(grupo);
        }

        repository.save(disciplina);

        return disciplina;
    }

    @Transactional
    public void excluir(Long id) {
        var disciplina = repository.findById(id).get();
        repository.delete(disciplina);
    }

    public Disciplina detalhar(Long id) {
        return repository.findById(id).get();
    }
}
