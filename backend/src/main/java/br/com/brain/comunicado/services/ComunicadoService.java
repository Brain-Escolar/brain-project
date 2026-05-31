package br.com.brain.comunicado.services;

import br.com.brain.comunicado.models.Comunicado;
import br.com.brain.comunicado.repository.ComunicadoRepository;
import br.com.brain.alerta.dto.CadastroAlertaDto;
import br.com.brain.comunicado.dto.AtualizacaoComunicadoDto;
import br.com.brain.comunicado.dto.CadastroComunicadoDto;
import br.com.brain.comunicado.dto.ListagemComunicadoDto;
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
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ComunicadoService {

    private final ComunicadoRepository repository;
    private final AlertaService alertaService;
    private final S3Service s3Service;

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public Comunicado cadastrarComunicado(CadastroComunicadoDto dados, MultipartFile imagem) {

        var comunicado = new Comunicado();
        comunicado.setTitulo(dados.titulo());
        comunicado.setConteudo(dados.conteudo());
        comunicado.setData(dados.data());
        comunicado.setCategoria(dados.categoria());
        comunicado.setAnexoUrl(dados.anexoUrl());

        if (imagem != null && !imagem.isEmpty()) {
            String key = "comunicados/" + UUID.randomUUID() + "-" + imagem.getOriginalFilename();
            s3Service.upload(key, imagem);
            comunicado.setImagemUrl(key);
        }

        repository.save(comunicado);

        alertaService.cadastrarAlerta(new CadastroAlertaDto(comunicado.getTitulo(), comunicado.getConteudo(), comunicado.getData()));

        return comunicado;
    }

    public Page<ListagemComunicadoDto> listar(Pageable paginacao) {
        return repository.findAll(paginacao).map(c -> {
            String imagemUrl = c.getImagemUrl() != null
                    ? s3Service.generatePresignedDownloadUrl(c.getImagemUrl(), Duration.ofHours(1))
                    : null;
            return new ListagemComunicadoDto(c, imagemUrl);
        });
    }

    @Transactional
    public Comunicado atualizar(AtualizacaoComunicadoDto dados, Long id) {
        var comunicado = repository.findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Comunicado", id));

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

        repository.save(comunicado);

        return comunicado;
    }

    @Transactional
    public void excluir(Long id) {
        var comunicado = repository
                .findById(id)
                .orElseThrow(
                        () -> ErrosSistema.RecursoNaoEncontradoException.para("Comunicado", id));
        repository.delete(comunicado);
    }

    public Comunicado detalhar(Long id) {
        return repository
                .findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Comunicado", id));
    }
}
