package br.com.brain.gradeCurricular.services;

import br.com.brain.disciplina.domain.Disciplina;
import br.com.brain.gradeCurricular.domain.DisciplinaGrade;
import br.com.brain.gradeCurricular.domain.DisciplinaGradeRepository;
import br.com.brain.gradeCurricular.domain.GradeCurricular;
import br.com.brain.gradeCurricular.domain.GradeCurricularRepository;
import br.com.brain.gradeCurricular.dtos.AtualizacaoGradeCurricularDto;
import br.com.brain.gradeCurricular.dtos.CadastroDisciplinaGradeDto;
import br.com.brain.gradeCurricular.dtos.CadastroGradeCurricularDto;
import br.com.brain.gradeCurricular.dtos.ListagemGradeCurricularDto;
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
public class GradeCurricularService {

    private final DisciplinaGradeRepository disciplinaGradeRepository;
    private final GradeCurricularRepository repository;

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public GradeCurricular cadastrarGradeCurricular(CadastroGradeCurricularDto dados) {

        var gradeCurricular = new GradeCurricular();
        gradeCurricular.setNome(dados.nome());

        repository.save(gradeCurricular);

        return gradeCurricular;
    }

    public Page<ListagemGradeCurricularDto> listar(Pageable paginacao) {
        return repository.findAll(paginacao).map(ListagemGradeCurricularDto::new);
    }

    @Transactional
    public GradeCurricular atualizar(Long id, AtualizacaoGradeCurricularDto dados) {
        var gradeCurricular = repository
                .findById(id)
                .orElseThrow(
                        () -> ErrosSistema.RecursoNaoEncontradoException.para("GradeCurricular", id));

        if (dados.nome() != null) {
            gradeCurricular.setNome(dados.nome());
        }
        repository.save(gradeCurricular);

        return gradeCurricular;
    }

    @Transactional
    public GradeCurricular desativar(Long id) {
        var gradeCurricular = repository
                .findById(id)
                .orElseThrow(
                        () -> ErrosSistema.RecursoNaoEncontradoException.para("GradeCurricular", id));
        gradeCurricular.setAtivo(false);
        repository.save(gradeCurricular);
        return gradeCurricular;
    }

    public GradeCurricular detalhar(Long id) {
        return repository
                .findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("GradeCurricular", id));
    }

    public GradeCurricular adicionarDisciplinas(CadastroDisciplinaGradeDto dados) {
        var gradeCurricular = repository
                .findById(dados.gradeCurricularId())
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("GradeCurricular",
                        dados.gradeCurricularId()));

        dados.disciplinasId().forEach(disciplinaId -> {
            var disciplina = em.find(Disciplina.class, disciplinaId);

            var disciplinaGrade = new DisciplinaGrade();
            disciplinaGrade.setDisciplina(disciplina);
            disciplinaGrade.setGradeCurricular(gradeCurricular);
            disciplinaGrade.setCargaHoraria(dados.cargaHoraria());
            disciplinaGrade.setObrigatoria(dados.obrigatoria());

            disciplinaGradeRepository.save(disciplinaGrade);
        });

        repository.save(gradeCurricular);
        return gradeCurricular;
    }
}
