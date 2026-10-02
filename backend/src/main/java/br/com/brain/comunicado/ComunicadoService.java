package br.com.brain.comunicado;

import br.com.brain.alerta.AlertaService;
import br.com.brain.alerta.dto.CadastroAlertaDto;
import br.com.brain.autenticacao.DadosAutenticacao;
import br.com.brain.comunicado.dto.AtualizacaoComunicadoDto;
import br.com.brain.comunicado.dto.CadastroComunicadoDto;
import br.com.brain.comunicado.dto.ListagemComunicadoDto;
import br.com.brain.dadosPessoais.DadosPessoaisRepository;
import br.com.brain.enums.PerfilNome;
import br.com.brain.exception.ErrosSistema;
import br.com.brain.infra.aws.S3Service;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ComunicadoService {

    /** Validade dos links temporários de imagem e anexo devolvidos ao front. */
    private static final Duration VALIDADE_LINK_ARQUIVO = Duration.ofHours(1);

    /** Perfis que administram o mural e por isso enxergam todo comunicado, não só os endereçados a eles. */
    private static final Set<PerfilNome> PERFIS_GESTAO = EnumSet.of(
            PerfilNome.ADMIN,
            PerfilNome.DIRETOR,
            PerfilNome.SECRETARIO,
            PerfilNome.COORDENADOR,
            PerfilNome.ORIENTADOR);

    private final ComunicadoRepository repository;
    private final ComunicadoDestinatarioRepository destinatarioRepository;
    private final ComunicadoDestinatarioService destinatarioService;
    private final DadosPessoaisRepository dadosPessoaisRepository;
    private final AlertaService alertaService;
    private final S3Service s3Service;

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public ListagemComunicadoDto cadastrarComunicado(CadastroComunicadoDto dados, MultipartFile imagem,
            MultipartFile anexo) {

        var comunicado = new Comunicado();
        comunicado.setTitulo(dados.titulo());
        comunicado.setConteudo(dados.conteudo());
        comunicado.setData(dados.data());
        comunicado.setCategoria(dados.categoria());
        comunicado.setAnexoUrl(dados.anexoUrl());

        if (imagem != null && !imagem.isEmpty()) {
            comunicado.setImagemUrl(enviarParaS3(imagem, "imagens"));
        }
        if (anexo != null && !anexo.isEmpty()) {
            comunicado.setAnexoUrl(enviarParaS3(anexo, "anexos"));
        }

        repository.save(comunicado);

        var destinatarios = destinatarioService.definirDestinatarios(comunicado, dados.destinatarios());

        alertaService.cadastrarAlerta(
                new CadastroAlertaDto(comunicado.getTitulo(), comunicado.getConteudo(), comunicado.getData()));

        return montarDto(comunicado, destinatarios);
    }

    public Page<ListagemComunicadoDto> listar(Pageable paginacao, DadosAutenticacao usuario) {
        var page = podeGerenciarMural(usuario)
                ? repository.findAll(paginacao)
                : repository.findVisiveisPara(usuario.getId(), paginacao);

        var nomesDosAutores = buscarNomesDosAutores(page.getContent());
        var destinatariosPorComunicado = buscarDestinatarios(page.getContent());

        return page.map(comunicado -> montarDto(
                comunicado,
                destinatariosPorComunicado.getOrDefault(comunicado.getId(), List.of()),
                nomesDosAutores.get(comunicado.getCriadoPor())));
    }

    @Transactional
    public ListagemComunicadoDto atualizar(AtualizacaoComunicadoDto dados, Long id, DadosAutenticacao usuario,
            MultipartFile imagem, MultipartFile anexo) {
        var comunicado = repository.findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Comunicado", id));

        verificarPermissaoDeEdicao(comunicado, usuario);

        if (dados.titulo() != null) {
            comunicado.setTitulo(dados.titulo());
        }
        if (dados.conteudo() != null) {
            comunicado.setConteudo(dados.conteudo());
        }
        if (dados.data() != null) {
            comunicado.setData(dados.data());
        }
        if (dados.categoria() != null) {
            comunicado.setCategoria(dados.categoria());
        }
        if (dados.imagemUrl() != null) {
            comunicado.setImagemUrl(dados.imagemUrl());
        }
        if (dados.anexoUrl() != null) {
            comunicado.setAnexoUrl(dados.anexoUrl());
        }
        if (imagem != null && !imagem.isEmpty()) {
            comunicado.setImagemUrl(enviarParaS3(imagem, "imagens"));
        }
        if (anexo != null && !anexo.isEmpty()) {
            comunicado.setAnexoUrl(enviarParaS3(anexo, "anexos"));
        }

        repository.save(comunicado);

        // Omitir "destinatarios" preserva o público atual; enviar a lista redefine e reentrega.
        var destinatarios = dados.destinatarios() != null
                ? destinatarioService.definirDestinatarios(comunicado, dados.destinatarios())
                : destinatarioRepository.findByComunicadoId(comunicado.getId());

        return montarDto(comunicado, destinatarios);
    }

    @Transactional
    public void excluir(Long id, DadosAutenticacao usuario) {
        var comunicado = repository
                .findById(id)
                .orElseThrow(
                        () -> ErrosSistema.RecursoNaoEncontradoException.para("Comunicado", id));
        verificarPermissaoDeEdicao(comunicado, usuario);
        destinatarioService.limpar(id);
        em.flush();
        repository.delete(comunicado);
    }

    public ListagemComunicadoDto detalhar(Long id) {
        var comunicado = repository
                .findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Comunicado", id));
        return montarDto(comunicado, destinatarioRepository.findByComunicadoId(id));
    }

    private String enviarParaS3(MultipartFile arquivo, String pasta) {
        String key = "comunicados/" + pasta + "/" + UUID.randomUUID() + "-" + arquivo.getOriginalFilename();
        s3Service.upload(key, arquivo);
        return key;
    }

    private ListagemComunicadoDto montarDto(Comunicado comunicado, List<ComunicadoDestinatario> destinatarios) {
        return montarDto(comunicado, destinatarios, buscarNomeDoAutor(comunicado.getCriadoPor()));
    }

    private ListagemComunicadoDto montarDto(Comunicado comunicado, List<ComunicadoDestinatario> destinatarios,
            String autorNome) {
        return new ListagemComunicadoDto(
                comunicado,
                gerarLinkTemporario(comunicado.getImagemUrl()),
                gerarLinkTemporario(comunicado.getAnexoUrl()),
                autorNome,
                destinatarios);
    }

    /** Anexos antigos foram salvos como link externo; só as chaves do S3 viram link temporário. */
    private String gerarLinkTemporario(String chave) {
        if (chave == null || chave.isBlank()) {
            return null;
        }
        if (chave.startsWith("http://") || chave.startsWith("https://")) {
            return chave;
        }
        return s3Service.generatePresignedDownloadUrl(chave, VALIDADE_LINK_ARQUIVO);
    }

    private String buscarNomeDoAutor(Long dadosPessoaisId) {
        if (dadosPessoaisId == null) {
            return null;
        }
        return dadosPessoaisRepository.findById(dadosPessoaisId)
                .map(dados -> dados.getNome())
                .orElse(null);
    }

    /** Carrega o público de toda a página de uma vez, em vez de uma consulta por comunicado. */
    private Map<Long, List<ComunicadoDestinatario>> buscarDestinatarios(List<Comunicado> comunicados) {
        var ids = comunicados.stream().map(Comunicado::getId).toList();

        if (ids.isEmpty()) {
            return Map.of();
        }

        return destinatarioRepository.findByComunicadoIdIn(ids).stream()
                .collect(Collectors.groupingBy(destinatario -> destinatario.getComunicado().getId()));
    }

    private Map<Long, String> buscarNomesDosAutores(List<Comunicado> comunicados) {
        var ids = comunicados.stream()
                .map(Comunicado::getCriadoPor)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        if (ids.isEmpty()) {
            return Map.of();
        }

        return dadosPessoaisRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(dados -> dados.getId(), dados -> dados.getNome(), (a, b) -> a));
    }

    private boolean podeGerenciarMural(DadosAutenticacao usuario) {
        return usuario.getDadosPessoais().getPerfis().stream()
                .anyMatch(perfil -> PERFIS_GESTAO.contains(perfil.getNome()));
    }

    /**
     * Quem publica só edita ou remove o que criou; Admin pode gerenciar qualquer comunicado.
     */
    private void verificarPermissaoDeEdicao(Comunicado comunicado, DadosAutenticacao usuario) {
        var dadosPessoais = usuario.getDadosPessoais();
        boolean isAdmin = dadosPessoais.getPerfis().stream().anyMatch(p -> p.getNome() == PerfilNome.ADMIN);
        boolean isAutor = dadosPessoais.getId().equals(comunicado.getCriadoPor());

        if (!isAdmin && !isAutor) {
            throw new ErrosSistema.AcessoNegadoException(
                    "Você só pode editar ou remover comunicados criados por você.");
        }
    }
}
