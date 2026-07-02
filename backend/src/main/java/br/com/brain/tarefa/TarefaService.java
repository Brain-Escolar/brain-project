package br.com.brain.tarefa;

import br.com.brain.arquivo.Arquivo;
import br.com.brain.arquivo.ArquivoRepository;
import br.com.brain.aula.Aula;
import br.com.brain.aula.AulaRepository;
import br.com.brain.conteudo.Conteudo;
import br.com.brain.conteudo.ConteudoRepository;
import br.com.brain.professor.Professor;
import br.com.brain.tarefa.dto.AtualizacaoTarefaDto;
import br.com.brain.tarefa.dto.CadastroTarefaDto;
import br.com.brain.tarefa.dto.CadastroTarefaConteudoLoteDto;
import br.com.brain.tarefa.dto.ListagemTarefaDto;
import br.com.brain.tarefa.dto.ListagemTarefaAlunoDto;
import br.com.brain.tarefa.dto.LoteRegistradoDto;
import br.com.brain.exception.ErrosSistema;
import br.com.brain.infra.aws.S3Service;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class TarefaService {

    private final TarefaRepository repository;
    private final AulaRepository aulaRepository;
    private final ConteudoRepository conteudoRepository;
    private final ArquivoRepository arquivoRepository;
    private final S3Service s3Service;

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public ListagemTarefaDto cadastrarTarefa(CadastroTarefaDto dados, MultipartFile arquivo, Professor professor) {
        var aula = em.getReference(Aula.class, dados.aulaId());

        var tarefa = new Tarefa();
        tarefa.setProfessor(professor);
        tarefa.setAula(aula);
        tarefa.setConteudo(dados.conteudo());
        tarefa.setDataCriacao(dados.dataCriacao() != null ? dados.dataCriacao() : LocalDate.now());
        tarefa.setPrazo(dados.prazo());

        if (arquivo != null && !arquivo.isEmpty()) {
            tarefa.setArquivo(salvarArquivo(arquivo));
        }

        repository.save(tarefa);
        return toDto(tarefa);
    }

    private Arquivo salvarArquivo(MultipartFile arquivo) {
        String key = "tarefas/" + UUID.randomUUID() + "-" + arquivo.getOriginalFilename();
        s3Service.upload(key, arquivo);
        var arquivoEntity = new Arquivo();
        arquivoEntity.setS3Key(key);
        arquivoEntity.setNomeOriginal(arquivo.getOriginalFilename());
        arquivoEntity.setContentType(arquivo.getContentType());
        arquivoEntity.setTamanho(arquivo.getSize());
        arquivoRepository.save(arquivoEntity);
        return arquivoEntity;
    }

    private boolean temTexto(String valor) {
        return valor != null && !valor.isBlank();
    }

    public ListagemTarefaDto toDto(Tarefa tarefa) {
        String downloadUrl = null;
        if (tarefa.getArquivo() != null) {
            downloadUrl = s3Service.generatePresignedDownloadUrl(
                    tarefa.getArquivo().getS3Key(), Duration.ofMinutes(5));
        }
        return new ListagemTarefaDto(tarefa, downloadUrl);
    }

    @Transactional
    public LoteRegistradoDto cadastrarTarefaLote(CadastroTarefaConteudoLoteDto dados, MultipartFile arquivo,
            Professor professor) {
        if (dados.addTarefa() && !temTexto(dados.tarefa())) {
            throw ErrosSistema.OperacaoInvalidaException
                    .com("Informe a tarefa de casa quando 'Tarefa de casa' estiver ativada.");
        }

        var aulas = aulaRepository.findByProfessorIdAndDisciplinaIdAndSerieId(
                professor.getId(), dados.disciplinaId(), dados.serieId());

        Map<Long, List<Aula>> aulasPorTurma = aulas.stream()
                .collect(Collectors.groupingBy(a -> a.getTurma().getId()));

        Arquivo arquivoEntity = null;
        if (arquivo != null && !arquivo.isEmpty()) {
            arquivoEntity = salvarArquivo(arquivo);
        }

        var criadas = new ArrayList<ListagemTarefaDto>();
        int turmasRegistradas = 0;

        for (var turmaId : dados.turmaIds()) {
            var aulasDaTurma = aulasPorTurma.get(turmaId);
            if (aulasDaTurma == null || aulasDaTurma.isEmpty()) {
                continue;
            }

            var aulasOrdenadas = aulasDaTurma.stream()
                    .sorted(Comparator.comparingInt((Aula a) -> a.getDiaSemana().getValue())
                            .thenComparing(a -> a.getHorario().getHorarioInicio()))
                    .toList();

            if (dados.numeroAula() > aulasOrdenadas.size()) {
                continue;
            }

            var aulaEscolhida = aulasOrdenadas.get(dados.numeroAula() - 1);
            LocalDate dataAula = dados.semanaInicio()
                    .plusDays(aulaEscolhida.getDiaSemana().getValue() - DayOfWeek.MONDAY.getValue());

            var conteudo = new Conteudo();
            conteudo.setAula(aulaEscolhida);
            conteudo.setConteudo(dados.conteudo());
            conteudo.setData(dataAula);
            conteudoRepository.save(conteudo);
            turmasRegistradas++;

            if (dados.addTarefa()) {
                LocalDate prazo;
                if (dados.numeroAula() < aulasOrdenadas.size()) {
                    var proxima = aulasOrdenadas.get(dados.numeroAula());
                    prazo = dados.semanaInicio()
                            .plusDays(proxima.getDiaSemana().getValue() - DayOfWeek.MONDAY.getValue());
                } else {
                    var primeira = aulasOrdenadas.get(0);
                    prazo = dados.semanaInicio().plusWeeks(1)
                            .plusDays(primeira.getDiaSemana().getValue() - DayOfWeek.MONDAY.getValue());
                }

                var tarefa = new Tarefa();
                tarefa.setProfessor(professor);
                tarefa.setAula(aulaEscolhida);
                tarefa.setConteudo(dados.tarefa());
                tarefa.setDataCriacao(dataAula);
                tarefa.setPrazo(prazo);
                if (arquivoEntity != null) {
                    tarefa.setArquivo(arquivoEntity);
                }
                repository.save(tarefa);
                criadas.add(toDto(tarefa));
            }
        }

        return new LoteRegistradoDto(turmasRegistradas, criadas.size(), criadas);
    }

    public Page<ListagemTarefaDto> listar(Pageable paginacao) {
        return repository.findAll(paginacao).map(this::toDto);
    }

    @Transactional
    public ListagemTarefaDto atualizar(AtualizacaoTarefaDto dados, Long id, MultipartFile arquivo) {
        var tarefa = repository
                .findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Tarefa", id));

        if (dados.conteudo() != null)
            tarefa.setConteudo(dados.conteudo());
        if (dados.professorId() != null)
            tarefa.setProfessor(em.getReference(Professor.class, dados.professorId()));
        if (dados.aulaId() != null)
            tarefa.setAula(em.getReference(Aula.class, dados.aulaId()));
        if (dados.prazo() != null)
            tarefa.setPrazo(dados.prazo());

        if (arquivo != null && !arquivo.isEmpty()) {
            tarefa.setArquivo(salvarArquivo(arquivo));
        }

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

    public Page<ListagemTarefaDto> recuperarTodasTarefasProfessor(Long id, Pageable paginacao) {
        return repository.findByProfessorId(id, paginacao).map(this::toDto);
    }

    public List<ListagemTarefaDto> listarTarefasPorAula(Long aulaId, LocalDate data) {
        var aula = aulaRepository.findById(aulaId)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Aula", aulaId));
        return repository
                .findByAulaTurmaIdAndAulaDisciplinaIdAndPrazo(
                        aula.getTurma().getId(), aula.getDisciplina().getId(), data)
                .stream().map(this::toDto).toList();
    }

    public java.util.Optional<ListagemTarefaDto> buscarDiarioPorAulaEData(Long aulaId, LocalDate data) {
        return repository
                .findByAulaIdAndDataCriacaoOrderByIdDesc(aulaId, data)
                .stream()
                .findFirst()
                .map(this::toDto);
    }

    public List<String> listarDatasComTarefas(Long aulaId) {
        var aula = aulaRepository.findById(aulaId)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Aula", aulaId));
        return repository
                .findDistinctPrazoByAulaTurmaIdAndAulaDisciplinaId(
                        aula.getTurma().getId(), aula.getDisciplina().getId())
                .stream().map(LocalDate::toString).toList();
    }

    public Page<ListagemTarefaAlunoDto> recuperarTarefasAluno(Long turmaId, Pageable paginacao) {
        return repository.findByAulaTurmaIdAndPrazoGreaterThanEqual(turmaId, LocalDate.now(), paginacao)
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
