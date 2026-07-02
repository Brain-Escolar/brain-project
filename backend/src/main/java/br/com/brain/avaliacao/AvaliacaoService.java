package br.com.brain.avaliacao;

import br.com.brain.arquivo.Arquivo;
import br.com.brain.arquivo.ArquivoRepository;
import br.com.brain.arquivo.dto.ListagemArquivoDto;
import br.com.brain.disciplina.Disciplina;
import br.com.brain.infra.aws.S3Service;
import br.com.brain.notas.NotasRepository;
import br.com.brain.avaliacao.dto.AtualizacaoAvaliacaoDto;
import br.com.brain.avaliacao.dto.CadastroAvaliacaoDto;
import br.com.brain.avaliacao.dto.DetalhamentoAvaliacaoDto;
import br.com.brain.avaliacao.dto.ListagemAvaliacaoDto;
import br.com.brain.exception.ErrosSistema;

import java.time.Duration;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class AvaliacaoService {

    private final AvaliacaoRepository repository;
    private final AvaliacaoTurmaRepository avaliacaoTurmaRepository;
    private final AvaliacaoTurmaService avaliacaoTurmaService;
    private final AvaliacaoAnexoRepository avaliacaoAnexoRepository;
    private final ArquivoRepository arquivoRepository;
    private final NotasRepository notasRepository;
    private final S3Service s3Service;

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public Avaliacao cadastrarAvaliacao(CadastroAvaliacaoDto dados, List<MultipartFile> anexos, Long professorPadraoId) {

        Disciplina disciplina = em.getReference(Disciplina.class, dados.disciplinaId());
        var avaliacao = new Avaliacao();
        avaliacao.setNome(dados.nome());
        avaliacao.setDisciplina(disciplina);
        avaliacao.setTipo(dados.tipo());
        avaliacao.setNotaMaxima(dados.notaMaxima());
        avaliacao.setConteudo(dados.conteudo());
        if (dados.notaExtra() != null) {
            avaliacao.setNotaExtra(dados.notaExtra());
        }

        repository.save(avaliacao);

        for (var turmaDto : dados.turmas()) {
            avaliacaoTurmaService.criarParaAvaliacao(avaliacao, turmaDto, professorPadraoId);
        }

        if (anexos != null) {
            for (var anexo : anexos) {
                adicionarAnexo(avaliacao, anexo);
            }
        }

        return avaliacao;
    }

    public Page<ListagemAvaliacaoDto> listar(Pageable paginacao) {
        return repository.findAll(paginacao).map(avaliacao -> construirListagem(avaliacao, null));
    }

    @Transactional
    public Avaliacao atualizar(AtualizacaoAvaliacaoDto dados, Long id) {
        var avaliacao = repository.findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Avaliação", id));

        if (dados.nome() != null) {
            avaliacao.setNome(dados.nome());
        }
        if (dados.disciplinaId() != null) {
            Disciplina disciplina = em.getReference(Disciplina.class, dados.disciplinaId());
            avaliacao.setDisciplina(disciplina);
        }
        if (dados.tipo() != null) {
            avaliacao.setTipo(dados.tipo());
        }
        if (dados.notaMaxima() != null) {
            avaliacao.setNotaMaxima(dados.notaMaxima());
        }
        if (dados.conteudo() != null) {
            avaliacao.setConteudo(dados.conteudo());
        }
        if (dados.notaExtra() != null) {
            avaliacao.setNotaExtra(dados.notaExtra());
        }
        repository.save(avaliacao);

        return avaliacao;
    }

    @Transactional
    public void excluir(Long id) {
        var avaliacao = repository.findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Avaliação", id));

        var turmas = avaliacaoTurmaRepository.findByAvaliacaoId(id);
        boolean temNotasLancadas = turmas.stream()
                .anyMatch(turma -> notasRepository.countByAvaliacaoTurmaId(turma.getId()) > 0);
        if (temNotasLancadas) {
            throw ErrosSistema.OperacaoInvalidaException
                    .com("Não é possível excluir uma avaliação que já possui notas lançadas.");
        }

        avaliacaoTurmaRepository.deleteAll(turmas);
        avaliacaoAnexoRepository.deleteAll(avaliacaoAnexoRepository.findByAvaliacaoId(id));
        repository.delete(avaliacao);
    }

    public DetalhamentoAvaliacaoDto detalhar(Long id) {
        var avaliacao = repository.findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Avaliação", id));

        var anexos = avaliacaoAnexoRepository.findByAvaliacaoId(id).stream()
                .map(anexo -> {
                    String downloadUrl = s3Service.generatePresignedDownloadUrl(
                            anexo.getArquivo().getS3Key(), Duration.ofMinutes(15));
                    return new ListagemArquivoDto(anexo.getArquivo(), downloadUrl);
                })
                .toList();

        var turmas = avaliacaoTurmaService.listarResumoPorAvaliacao(id);

        return new DetalhamentoAvaliacaoDto(avaliacao, anexos, turmas);
    }

    public Page<ListagemAvaliacaoDto> listarPorProfessor(Long professorId, Pageable paginacao) {
        return repository.findDistinctByAvaliacoesTurmasProfessorId(professorId, paginacao)
                .map(avaliacao -> construirListagem(avaliacao, professorId));
    }

    @Transactional
    public void adicionarAnexo(Avaliacao avaliacao, MultipartFile anexo) {
        String key = "avaliacoes/" + UUID.randomUUID() + "-" + anexo.getOriginalFilename();
        s3Service.upload(key, anexo);

        var arquivo = new Arquivo();
        arquivo.setS3Key(key);
        arquivo.setNomeOriginal(anexo.getOriginalFilename());
        arquivo.setContentType(anexo.getContentType());
        arquivo.setTamanho(anexo.getSize());
        arquivoRepository.save(arquivo);

        var avaliacaoAnexo = new AvaliacaoAnexo();
        avaliacaoAnexo.setArquivo(arquivo);
        avaliacaoAnexo.setAvaliacao(avaliacao);
        avaliacaoAnexoRepository.save(avaliacaoAnexo);
    }

    private ListagemAvaliacaoDto construirListagem(Avaliacao avaliacao, Long professorId) {
        var turmas = professorId != null
                ? avaliacaoTurmaRepository.findByAvaliacaoIdAndProfessorId(avaliacao.getId(), professorId)
                : avaliacaoTurmaRepository.findByAvaliacaoId(avaliacao.getId());

        long totalTurmas = turmas.size();
        long turmasLancadas = turmas.stream()
                .map(avaliacaoTurmaService::construirListagem)
                .filter(resumo -> resumo.totalAlunos() > 0 && resumo.alunosCorrigidos() >= resumo.totalAlunos())
                .count();
        var turmaIds = turmas.stream().map(turma -> turma.getTurma().getId()).toList();

        return new ListagemAvaliacaoDto(avaliacao, totalTurmas, turmasLancadas, turmaIds);
    }
}
