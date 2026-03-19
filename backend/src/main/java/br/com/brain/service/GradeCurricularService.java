package br.com.brain.service;

import br.com.brain.domain.disciplina.Disciplina;
import br.com.brain.domain.disciplinaGrade.DisciplinaGrade;
import br.com.brain.domain.disciplinaGrade.DisciplinaGradeRepository;
import br.com.brain.domain.gradeCurricular.GradeCurricular;
import br.com.brain.domain.gradeCurricular.GradeCurricularRepository;
import br.com.brain.dto.gradeCurricular.AtualizacaoGradeCurricularDto;
import br.com.brain.dto.gradeCurricular.CadastroDisciplinaGradeDto;
import br.com.brain.dto.gradeCurricular.CadastroGradeCurricularDto;
import br.com.brain.dto.gradeCurricular.ListagemGradeCurricularDto;
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
