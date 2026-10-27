package br.com.brain.turma;

import br.com.brain.serie.Serie;
import br.com.brain.unidade.Unidade;
import br.com.brain.aluno.AlunoRepository;
import br.com.brain.aluno.dto.ListagemAlunoDto;
import br.com.brain.configuracaoAcademica.AnoLetivoService;
import br.com.brain.matricula.EnturmacaoService;
import br.com.brain.matricula.MatriculaRepository;
import br.com.brain.turma.dto.AtualizacaoTurmaDto;
import br.com.brain.turma.dto.CadastroTurmaDto;
import br.com.brain.turma.dto.ListagemTurmaDto;
import br.com.brain.enums.Turno;
import br.com.brain.exception.ErrosSistema;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TurmaService {

    private final TurmaRepository repository;
    private final AlunoRepository alunoRepository;
    private final AnoLetivoService anoLetivoService;
    private final MatriculaRepository matriculaRepository;
    private final EnturmacaoService enturmacaoService;

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public Turma cadastrarTurma(CadastroTurmaDto dados) {

        anoLetivoService.garantir(dados.anoLetivo());

        Serie serie = em.find(Serie.class, dados.serieId());
        Unidade unidade = em.find(Unidade.class, dados.unidadeId());

        var turma = new Turma();
        turma.setNome(dados.nome());
        turma.setAnoLetivo(dados.anoLetivo());
        turma.setSerie(serie);
        turma.setTurno(Turno.valueOf(dados.turno().toUpperCase()));
        turma.setUnidade(unidade);
        turma.setVagas(dados.vagas());
        turma.setSala(dados.sala());

        repository.save(turma);

        return turma;
    }

    /** Turmas de um ano letivo; sem ano, as do ano corrente. */
    public Page<ListagemTurmaDto> listar(Integer anoLetivo, Pageable paginacao) {
        int ano = anoLetivo != null ? anoLetivo : anoLetivoService.anoCorrente();
        return repository.findByAnoLetivo(ano, paginacao).map(this::toListagemDto);
    }

    public ListagemTurmaDto toListagemDto(Turma turma) {
        int ocupadas = (int) matriculaRepository.countAlunosDaTurma(turma.getId());
        return new ListagemTurmaDto(turma, ocupadas);
    }

    @Transactional
    public Turma atualizar(Long id, AtualizacaoTurmaDto dados) {
        var turma = repository
                .findById(id)
                .orElseThrow(
                        () -> ErrosSistema.RecursoNaoEncontradoException.para("Turma", id));
        anoLetivoService.exigirEditavel(turma.getAnoLetivo());

        if (dados.nome() != null) {
            turma.setNome(dados.nome());
        }
        if (dados.sala() != null) {
            turma.setSala(dados.sala());
        }
        repository.save(turma);

        return turma;
    }

    @Transactional
    public void excluir(Long id) {
        var turma = repository
                .findById(id)
                .orElseThrow(
                        () -> ErrosSistema.RecursoNaoEncontradoException.para("Turma", id));
        repository.delete(turma);
    }

    public Turma detalhar(Long id) {
        return repository
                .findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Turma", id));
    }

    public List<ListagemAlunoDto> listarAlunos(Long id) {
        var turma = repository
                .findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Turma", id));
        return matriculaRepository.findAlunosDaTurma(turma.getId()).stream().map(ListagemAlunoDto::new).toList();
    }

    @Transactional
    public void vincularAlunos(Long turmaId, List<Long> alunoIds) {
        var turma = repository
                .findById(turmaId)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Turma", turmaId));

        int ocupadas = (int) matriculaRepository.countAlunosDaTurma(turmaId);
        if (ocupadas + alunoIds.size() > turma.getVagas()) {
            throw ErrosSistema.OperacaoInvalidaException
                    .com("Turma não tem vagas suficientes para " + alunoIds.size() + " aluno(s).");
        }

        for (Long alunoId : alunoIds) {
            var aluno = alunoRepository
                    .findById(alunoId)
                    .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Aluno", alunoId));
            enturmacaoService.enturmar(aluno, turma);
            alunoRepository.save(aluno);
        }
    }

    @Transactional
    public void desvincularAluno(Long turmaId, Long alunoId) {
        var aluno = alunoRepository
                .findById(alunoId)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Aluno", alunoId));

        var turma = repository
                .findById(turmaId)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Turma", turmaId));
        boolean naTurma = matriculaRepository.findAlunosDaTurma(turmaId).stream()
                .anyMatch(a -> a.getId().equals(alunoId));
        if (!naTurma) {
            throw ErrosSistema.OperacaoInvalidaException.com("Aluno não pertence a esta turma.");
        }

        enturmacaoService.desenturmar(aluno, turma);
        alunoRepository.save(aluno);
    }
}
