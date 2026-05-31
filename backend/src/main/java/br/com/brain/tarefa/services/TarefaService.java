package br.com.brain.tarefa.services;

import br.com.brain.arquivo.models.Arquivo;
import br.com.brain.arquivo.repository.ArquivoRepository;
import br.com.brain.aula.repository.AulaRepository;
import br.com.brain.professor.models.Professor;
import br.com.brain.tarefa.models.Tarefa;
import br.com.brain.turma.models.Turma;
import br.com.brain.tarefa.repository.TarefaRepository;
import br.com.brain.tarefa.dto.AtualizacaoTarefaDto;
import br.com.brain.tarefa.dto.CadastroTarefaDto;
import br.com.brain.tarefa.dto.ListagemTarefaDto;
import br.com.brain.tarefa.dto.ListagemTarefaAlunoDto;
import br.com.brain.exception.ErrosSistema;
import br.com.brain.infra.aws.S3Service;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import java.time.Duration;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class TarefaService {

    private final TarefaRepository repository;
    private final AulaRepository aulaRepository;
    private final ArquivoRepository arquivoRepository;
    private final S3Service s3Service;

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public ListagemTarefaDto cadastrarTarefa(CadastroTarefaDto dados, MultipartFile arquivo, Professor professor) {
        var turma = em.getReference(Turma.class, dados.turmaId());

        var tarefa = new Tarefa();
        tarefa.setProfessor(professor);
        tarefa.setTurma(turma);
        tarefa.setConteudo(dados.conteudo());
        tarefa.setDataCriacao(LocalDate.now());
        tarefa.setPrazo(dados.prazo());
        tarefa.setTitulo(dados.titulo());

        if (arquivo != null && !arquivo.isEmpty()) {
            String key = "tarefas/" + UUID.randomUUID() + "-" + arquivo.getOriginalFilename();
            s3Service.upload(key, arquivo);
            var arquivoEntity = new Arquivo();
            arquivoEntity.setS3Key(key);
            arquivoEntity.setNomeOriginal(arquivo.getOriginalFilename());
            arquivoEntity.setContentType(arquivo.getContentType());
            arquivoEntity.setTamanho(arquivo.getSize());
            arquivoRepository.save(arquivoEntity);
            tarefa.setArquivo(arquivoEntity);
        }

        repository.save(tarefa);
        return toDto(tarefa);
    }

    public ListagemTarefaDto toDto(Tarefa tarefa) {
        String downloadUrl = null;
        if (tarefa.getArquivo() != null) {
            downloadUrl = s3Service.generatePresignedDownloadUrl(
                    tarefa.getArquivo().getS3Key(), Duration.ofMinutes(5));
        }
        return new ListagemTarefaDto(tarefa, downloadUrl);
    }

    public Page<ListagemTarefaDto> listar(Pageable paginacao) {
        return repository.findAll(paginacao).map(this::toDto);
    }

    @Transactional
    public ListagemTarefaDto atualizar(AtualizacaoTarefaDto dados, Long id) {
        var tarefa = repository
                .findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Tarefa", id));

        if (dados.titulo() != null)
            tarefa.setTitulo(dados.titulo());
        if (dados.conteudo() != null)
            tarefa.setConteudo(dados.conteudo());
        if (dados.professorId() != null)
            tarefa.setProfessor(em.getReference(Professor.class, dados.professorId()));
        if (dados.turmaId() != null)
            tarefa.setTurma(em.getReference(Turma.class, dados.turmaId()));
        if (dados.prazo() != null)
            tarefa.setPrazo(dados.prazo());

        repository.save(tarefa);
        return toDto(tarefa);
    }

    @Transactional
    public void excluir(Long id) {
        var tarefa = repository
                .findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Tarefa", id));
        repository.delete(tarefa);
    }

    public ListagemTarefaDto detalhar(Long id) {
        var tarefa = repository
                .findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Tarefa", id));
        return toDto(tarefa);
    }

    public Page<ListagemTarefaDto> recuperarTarefasProfessor(Long id, Pageable paginacao) {
        return repository.findByProfessorIdAndPrazoAfter(id, LocalDate.now(), paginacao).map(this::toDto);
    }

    public List<ListagemTarefaDto> listarTarefasPorAula(Long aulaId, LocalDate data) {
        var aula = aulaRepository.findById(aulaId)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Aula", aulaId));
        return repository.findByTurmaIdAndPrazo(aula.getTurma().getId(), data)
                .stream().map(this::toDto).toList();
    }

    public List<String> listarDatasComTarefas(Long aulaId) {
        var aula = aulaRepository.findById(aulaId)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Aula", aulaId));
        return repository.findDistinctPrazoByTurmaId(aula.getTurma().getId())
                .stream().map(LocalDate::toString).toList();
    }

    public Page<ListagemTarefaAlunoDto> recuperarTarefasAluno(Long turmaId, Pageable paginacao) {
        return repository.findByTurmaIdAndPrazoGreaterThanEqual(turmaId, LocalDate.now(), paginacao)
                .map(t -> {
                    String downloadUrl = null;
                    if (t.getArquivo() != null) {
                        downloadUrl = s3Service.generatePresignedDownloadUrl(
                                t.getArquivo().getS3Key(), Duration.ofMinutes(5));
                    }
                    return new ListagemTarefaAlunoDto(t, downloadUrl);
                });
    }
}
