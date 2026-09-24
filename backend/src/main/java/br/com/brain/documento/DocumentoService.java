package br.com.brain.documento;

import br.com.brain.aluno.Aluno;
import br.com.brain.aluno.AlunoRepository;
import br.com.brain.arquivo.Arquivo;
import br.com.brain.arquivo.dto.ListagemArquivoDto;
import br.com.brain.dadosPessoais.DadosPessoais;
import br.com.brain.dadosPessoais.DadosPessoaisRepository;
import br.com.brain.documento.dto.DetalhamentoDocumentoDto;
import br.com.brain.documento.dto.DocumentacaoAlunoDto;
import br.com.brain.documento.dto.DocumentacaoPessoaDto;
import br.com.brain.documento.dto.DocumentacaoPessoaDto.PapelDocumentacao;
import br.com.brain.documento.dto.FotoDto;
import br.com.brain.documento.dto.ItemChecklistDocumentoDto;
import br.com.brain.documento.dto.ListagemDocumentoFilaDto;
import br.com.brain.enums.SituacaoDocumento;
import br.com.brain.enums.StatusDocumento;
import br.com.brain.enums.TipoDocumento;
import br.com.brain.exception.ErrosSistema.OperacaoInvalidaException;
import br.com.brain.exception.ErrosSistema.RecursoNaoEncontradoException;
import br.com.brain.infra.aws.S3Service;
import br.com.brain.responsavel.Responsavel;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Documentos de matricula e foto das pessoas.
 *
 * Nao faz autorizacao por vinculo: quem chama pelo portal do responsavel passa
 * antes pelo VinculoResponsavelGuard (ver ResponsavelPortalService).
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DocumentoService {

    static final int MAX_ARQUIVOS_POR_DOCUMENTO = 5;
    private static final Duration VALIDADE_URL_DOCUMENTO = Duration.ofMinutes(5);
    private static final Duration VALIDADE_URL_FOTO = Duration.ofHours(1);

    private final DocumentoRepository repository;
    private final AlunoRepository alunoRepository;
    private final DadosPessoaisRepository dadosPessoaisRepository;
    private final ArmazenamentoDocumentoService armazenamento;
    private final S3Service s3Service;

    // ------------------------------------------------------------- checklist

    /** Visao da secretaria: o aluno e todos os responsaveis. */
    public DocumentacaoAlunoDto documentacaoDoAluno(Long alunoId) {
        var aluno = alunoRepository.findById(alunoId)
                .orElseThrow(() -> RecursoNaoEncontradoException.para("Aluno", alunoId));
        return montarDocumentacao(aluno, aluno.getResponsaveis());
    }

    /**
     * Visao do portal: o aluno e o proprio responsavel logado. Os documentos
     * dos OUTROS responsaveis ficam de fora - pais separados nao veem o RG e o
     * comprovante de residencia um do outro.
     */
    public DocumentacaoAlunoDto documentacaoParaResponsavel(Aluno aluno, Responsavel responsavel) {
        return montarDocumentacao(aluno, List.of(responsavel));
    }

    private DocumentacaoAlunoDto montarDocumentacao(Aluno aluno, List<Responsavel> responsaveis) {
        if (aluno.getDadosPessoais() == null) {
            throw OperacaoInvalidaException.com("Aluno sem dados pessoais cadastrados.");
        }
        var ids = new ArrayList<Long>();
        ids.add(aluno.getDadosPessoais().getId());
        responsaveis.stream()
                .map(Responsavel::getDadosPessoais)
                .filter(dp -> dp != null)
                .forEach(dp -> ids.add(dp.getId()));

        Map<Long, List<Documento>> porPessoa = repository.findByDadosPessoaisIdIn(ids).stream()
                .collect(Collectors.groupingBy(d -> d.getDadosPessoais().getId()));

        var pessoas = new ArrayList<DocumentacaoPessoaDto>();
        pessoas.add(montarPessoa(aluno.getDadosPessoais(), PapelDocumentacao.ALUNO, false,
                RequisitosDocumentacao.doAluno(), porPessoa));
        for (var responsavel : responsaveis) {
            if (responsavel.getDadosPessoais() == null) {
                continue;
            }
            boolean financeiro = Boolean.TRUE.equals(responsavel.getFinanceiro());
            pessoas.add(montarPessoa(responsavel.getDadosPessoais(), PapelDocumentacao.RESPONSAVEL, financeiro,
                    RequisitosDocumentacao.doResponsavel(financeiro), porPessoa));
        }

        boolean completa = pessoas.stream().allMatch(DocumentacaoPessoaDto::completa);
        return new DocumentacaoAlunoDto(aluno.getId(), completa, pessoas);
    }

    private DocumentacaoPessoaDto montarPessoa(DadosPessoais pessoa, PapelDocumentacao papel, boolean financeiro,
            List<RequisitosDocumentacao.Requisito> requisitos, Map<Long, List<Documento>> porPessoa) {
        Map<TipoDocumento, Documento> enviados = porPessoa.getOrDefault(pessoa.getId(), List.of()).stream()
                .collect(Collectors.toMap(Documento::getTipo, Function.identity(), (a, b) -> a,
                        () -> new EnumMap<>(TipoDocumento.class)));
        Map<TipoDocumento, Boolean> obrigatoriedade = requisitos.stream()
                .collect(Collectors.toMap(RequisitosDocumentacao.Requisito::tipo,
                        RequisitosDocumentacao.Requisito::obrigatorio, (a, b) -> a,
                        () -> new EnumMap<>(TipoDocumento.class)));

        // Exigidos na ordem definida, depois qualquer outro que tenha sido enviado.
        var tipos = new LinkedHashSet<TipoDocumento>();
        requisitos.forEach(r -> tipos.add(r.tipo()));
        tipos.addAll(enviados.keySet());

        var itens = tipos.stream()
                .map(tipo -> {
                    var documento = enviados.get(tipo);
                    return new ItemChecklistDocumentoDto(
                            tipo,
                            tipo.getDescricao(),
                            obrigatoriedade.getOrDefault(tipo, false),
                            situacao(documento),
                            documento == null ? null : detalhar(documento));
                })
                .toList();

        boolean completa = RequisitosDocumentacao.atendidos(requisitos, enviados.values());

        return new DocumentacaoPessoaDto(pessoa.getId(), pessoa.getNome(), papel, financeiro,
                urlFoto(pessoa), completa, itens);
    }

    static SituacaoDocumento situacao(Documento documento) {
        if (documento == null) {
            return SituacaoDocumento.PENDENTE;
        }
        return switch (documento.getStatus()) {
            case EM_ANALISE -> SituacaoDocumento.EM_ANALISE;
            case REJEITADO -> SituacaoDocumento.REJEITADO;
            case APROVADO -> documento.isVencido() ? SituacaoDocumento.VENCIDO : SituacaoDocumento.APROVADO;
        };
    }

    // ----------------------------------------------------------------- envio

    /** Envio pela secretaria: pode substituir qualquer documento, inclusive aprovado. */
    @Transactional
    public DetalhamentoDocumentoDto enviar(Long dadosPessoaisId, TipoDocumento tipo, List<MultipartFile> arquivos) {
        var pessoa = dadosPessoaisRepository.findById(dadosPessoaisId)
                .orElseThrow(() -> RecursoNaoEncontradoException.para("Pessoa", dadosPessoaisId));
        return detalhar(registrarEnvio(pessoa, tipo, arquivos, true));
    }

    /**
     * Envio pelo portal. A familia nao substitui documento ja aprovado e em
     * dia: isso tiraria a matricula de "documentacao completa" sem a escola
     * pedir. Vencido ou rejeitado, pode reenviar.
     */
    @Transactional
    public DetalhamentoDocumentoDto enviarPeloPortal(DadosPessoais pessoa, TipoDocumento tipo,
            List<MultipartFile> arquivos) {
        return detalhar(registrarEnvio(pessoa, tipo, arquivos, false));
    }

    private Documento registrarEnvio(DadosPessoais pessoa, TipoDocumento tipo, List<MultipartFile> arquivos,
            boolean podeSubstituirAprovado) {
        if (pessoa == null) {
            throw OperacaoInvalidaException.com("Pessoa sem dados pessoais cadastrados.");
        }
        if (tipo == null) {
            throw OperacaoInvalidaException.com("Informe o tipo do documento.");
        }
        var validos = arquivos == null ? List.<MultipartFile>of()
                : arquivos.stream().filter(a -> a != null && !a.isEmpty()).toList();
        if (validos.isEmpty()) {
            throw OperacaoInvalidaException.com("Envie ao menos um arquivo.");
        }
        if (validos.size() > MAX_ARQUIVOS_POR_DOCUMENTO) {
            throw OperacaoInvalidaException.com(
                    "Envie no máximo %d arquivos por documento.".formatted(MAX_ARQUIVOS_POR_DOCUMENTO));
        }

        var documento = repository.findByDadosPessoaisIdAndTipo(pessoa.getId(), tipo).orElseGet(() -> {
            var novo = new Documento();
            novo.setDadosPessoais(pessoa);
            novo.setTipo(tipo);
            return novo;
        });
        boolean aprovadoEmDia = documento.getId() != null && situacao(documento) == SituacaoDocumento.APROVADO;
        if (!podeSubstituirAprovado && aprovadoEmDia) {
            throw OperacaoInvalidaException.com(
                    "Este documento já foi aprovado pela escola. Para substituí-lo, fale com a secretaria.");
        }

        List<Arquivo> salvos = validos.stream().map(armazenamento::salvarDocumento).toList();
        documento.registrarEnvio(salvos);
        return repository.save(documento);
    }

    // ------------------------------------------------------------- validacao

    public Page<ListagemDocumentoFilaDto> fila(StatusDocumento status, Pageable paginacao) {
        var filtro = status == null ? StatusDocumento.EM_ANALISE : status;
        return repository.findByStatus(filtro, paginacao).map(ListagemDocumentoFilaDto::new);
    }

    public DetalhamentoDocumentoDto detalhar(Long id) {
        return detalhar(buscar(id));
    }

    @Transactional
    public DetalhamentoDocumentoDto aprovar(Long id, Long validadorDadosPessoaisId, LocalDate dataValidade) {
        var documento = buscarEmAnalise(id);
        documento.aprovar(dadosPessoaisRepository.getReferenceById(validadorDadosPessoaisId), dataValidade);
        return detalhar(documento);
    }

    @Transactional
    public DetalhamentoDocumentoDto rejeitar(Long id, Long validadorDadosPessoaisId, String motivo) {
        if (motivo == null || motivo.isBlank()) {
            throw OperacaoInvalidaException.com("Informe o motivo da rejeição.");
        }
        var documento = buscarEmAnalise(id);
        documento.rejeitar(dadosPessoaisRepository.getReferenceById(validadorDadosPessoaisId), motivo.trim());
        return detalhar(documento);
    }

    private Documento buscar(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> RecursoNaoEncontradoException.para("Documento", id));
    }

    private Documento buscarEmAnalise(Long id) {
        var documento = buscar(id);
        if (documento.getStatus() != StatusDocumento.EM_ANALISE) {
            throw OperacaoInvalidaException.com("Só é possível validar documentos em análise.");
        }
        return documento;
    }

    private DetalhamentoDocumentoDto detalhar(Documento documento) {
        var arquivos = documento.getArquivos().stream()
                .map(a -> new ListagemArquivoDto(a,
                        s3Service.generatePresignedDownloadUrl(a.getS3Key(), VALIDADE_URL_DOCUMENTO)))
                .toList();
        return new DetalhamentoDocumentoDto(
                documento.getId(),
                documento.getTipo(),
                documento.getTipo().getDescricao(),
                documento.getStatus(),
                documento.getMotivoRejeicao(),
                documento.getDataValidade(),
                documento.getEnviadoEm(),
                documento.getValidadoPor() == null ? null : documento.getValidadoPor().getNome(),
                documento.getValidadoEm(),
                arquivos);
    }

    // ------------------------------------------------------------------ foto

    @Transactional
    public FotoDto atualizarFoto(Long dadosPessoaisId, MultipartFile foto) {
        var pessoa = dadosPessoaisRepository.findById(dadosPessoaisId)
                .orElseThrow(() -> RecursoNaoEncontradoException.para("Pessoa", dadosPessoaisId));
        return atualizarFoto(pessoa, foto);
    }

    /** A foto anterior fica no S3: o _AUD de dados_pessoais continua apontando para ela. */
    @Transactional
    public FotoDto atualizarFoto(DadosPessoais pessoa, MultipartFile foto) {
        if (pessoa == null) {
            throw OperacaoInvalidaException.com("Pessoa sem dados pessoais cadastrados.");
        }
        pessoa.setFoto(armazenamento.salvarFoto(foto));
        dadosPessoaisRepository.save(pessoa);
        return new FotoDto(pessoa.getId(), urlFoto(pessoa));
    }

    public String urlFoto(DadosPessoais pessoa) {
        if (pessoa.getFoto() == null) {
            return null;
        }
        return s3Service.generatePresignedDownloadUrl(pessoa.getFoto().getS3Key(), VALIDADE_URL_FOTO);
    }
}
