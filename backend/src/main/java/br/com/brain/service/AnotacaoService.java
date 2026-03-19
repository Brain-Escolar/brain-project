package br.com.brain.service;

import br.com.brain.domain.aluno.Aluno;
import br.com.brain.domain.anotacao.Anotacao;
import br.com.brain.domain.anotacao.AnotacaoRepository;
import br.com.brain.domain.aula.Aula;
import br.com.brain.dto.aluno.AlunosAulaDto;
import br.com.brain.dto.anotacao.AnotacaoAulaDto;
import br.com.brain.dto.anotacao.AtualizacaoAnotacaoDto;
import br.com.brain.dto.anotacao.CadastroAnotacaoDto;
import br.com.brain.dto.anotacao.ListagemAnotacaoDto;
import br.com.brain.exception.ErrosSistema;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;

import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AnotacaoService {

    private final AnotacaoRepository repository;
    private final ChamadaService chamadaService;

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public Anotacao cadastrarAnotacao(CadastroAnotacaoDto dados) {

        Aluno aluno = em.getReference(Aluno.class, dados.alunoId());
        Aula aula = em.getReference(Aula.class, dados.aulaId());
        var anotacao = new Anotacao();
        anotacao.setAluno(aluno);
        anotacao.setAula(aula);
        anotacao.setTipoAnotacao(dados.tipoAnotacao());
        anotacao.setDataAnotacao(dados.data());
        anotacao.setObservacao(dados.observacao());

        repository.save(anotacao);

        return anotacao;
    }

    public Page<ListagemAnotacaoDto> listar(Pageable paginacao) {
        return repository.findAll(paginacao).map(ListagemAnotacaoDto::new);
    }

    @Transactional
    public Anotacao atualizar(AtualizacaoAnotacaoDto dados, Long id) {
        var anotacao = repository.findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Anotacao", id));

        if (dados.alunoId() != null) {
            Aluno aluno = em.getReference(Aluno.class, dados.alunoId());
            anotacao.setAluno(aluno);
        }
        if (dados.tipoAnotacao() != null) {
            anotacao.setTipoAnotacao(dados.tipoAnotacao());
        }
        if (dados.data() != null) {
            anotacao.setDataAnotacao(dados.data());
        }
        if (dados.aulaId() != null) {
            Aula aula = em.getReference(Aula.class, dados.aulaId());
            anotacao.setAula(aula);
        }
        if (dados.observacao() != null) {
            anotacao.setObservacao(dados.observacao());
        }

        repository.save(anotacao);

        return anotacao;
    }

    @Transactional
    public void excluir(Long id) {
        var anotacao = repository.findById(id).get();
        repository.delete(anotacao);
    }

    public Anotacao detalhar(Long id) {
        return repository.findById(id).get();
    }

    public List<AlunosAulaDto> recuperarAnotacoesPorDisciplina(Long disciplinaId, List<Aluno> alunos) {
        return alunos.stream()
                .map(aluno -> {
                    var anotacoes = repository.findByDisciplinaIdAndAlunoId(disciplinaId, aluno.getId());
                    var falta = chamadaService.contarFaltasPorAlunoEPorDisciplina(aluno.getId(), disciplinaId);
                    return new AlunosAulaDto(aluno, anotacoes, falta);
                })
                .toList();
    }

    public List<AnotacaoAulaDto> recuperarAnotacoesPorAula(Long aulaId, LocalDate data) {
        return repository.findByAulaIdAndDataAnotacao(aulaId, data).stream()
                .map(anotacao -> new AnotacaoAulaDto(anotacao))
                .toList();
    }
}
