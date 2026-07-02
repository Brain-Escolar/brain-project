package br.com.brain.materialComplementar;

import br.com.brain.arquivo.Arquivo;
import br.com.brain.arquivo.ArquivoRepository;
import br.com.brain.aula.AulaRepository;
import br.com.brain.disciplina.Disciplina;
import br.com.brain.enums.TipoMaterial;
import br.com.brain.exception.ErrosSistema;
import br.com.brain.infra.aws.S3Service;
import br.com.brain.materialComplementar.dto.CadastroMaterialComplementarDto;
import br.com.brain.materialComplementar.dto.ListagemMaterialComplementarDto;
import br.com.brain.professor.Professor;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.time.Duration;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MaterialComplementarService {

    private final MaterialComplementarRepository repository;
    private final AulaRepository aulaRepository;
    private final ArquivoRepository arquivoRepository;
    private final S3Service s3Service;

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public MaterialComplementar cadastrar(CadastroMaterialComplementarDto dados, MultipartFile arquivo,
            Professor professor) {
        if (!aulaRepository.existsByProfessorIdAndDisciplinaId(professor.getId(), dados.disciplinaId())) {
            throw ErrosSistema.OperacaoInvalidaException
                    .com("Você não leciona essa disciplina.");
        }

        if (dados.tipo() == TipoMaterial.LINK && (dados.url() == null || dados.url().isBlank())) {
            throw ErrosSistema.OperacaoInvalidaException.com("Informe a URL do link.");
        }
        if (dados.tipo() == TipoMaterial.ARQUIVO && (arquivo == null || arquivo.isEmpty())) {
            throw ErrosSistema.OperacaoInvalidaException.com("Anexe o arquivo do material.");
        }

        var material = new MaterialComplementar();
        material.setDisciplina(em.getReference(Disciplina.class, dados.disciplinaId()));
        material.setProfessor(professor);
        material.setTitulo(dados.titulo());
        material.setDescricao(dados.descricao());
        material.setTipo(dados.tipo());

        if (dados.tipo() == TipoMaterial.LINK) {
            material.setUrl(dados.url().trim());
        } else {
            material.setArquivo(salvarArquivo(arquivo));
        }

        repository.save(material);
        return material;
    }

    private Arquivo salvarArquivo(MultipartFile arquivo) {
        String key = "materiais-complementares/" + UUID.randomUUID() + "-" + arquivo.getOriginalFilename();
        s3Service.upload(key, arquivo);
        var arquivoEntity = new Arquivo();
        arquivoEntity.setS3Key(key);
        arquivoEntity.setNomeOriginal(arquivo.getOriginalFilename());
        arquivoEntity.setContentType(arquivo.getContentType());
        arquivoEntity.setTamanho(arquivo.getSize());
        arquivoRepository.save(arquivoEntity);
        return arquivoEntity;
    }

    private String dominioDe(String url) {
        try {
            String comEsquema = url.matches("(?i)^https?://.*") ? url : "https://" + url;
            String host = URI.create(comEsquema).getHost();
            return host != null ? host.replaceFirst("^www\\.", "") : url;
        } catch (Exception e) {
            return url;
        }
    }

    public ListagemMaterialComplementarDto paraDto(MaterialComplementar material) {
        String dominio = material.getTipo() == TipoMaterial.LINK ? dominioDe(material.getUrl()) : null;
        String downloadUrl = material.getArquivo() != null
                ? s3Service.generatePresignedDownloadUrl(material.getArquivo().getS3Key(), Duration.ofMinutes(5))
                : null;
        return new ListagemMaterialComplementarDto(material, dominio, downloadUrl);
    }

    public List<ListagemMaterialComplementarDto> listarPorProfessor(Long professorId) {
        var disciplinaIds = aulaRepository.findDisciplinaIdsDistinctByProfessorId(professorId);
        if (disciplinaIds.isEmpty()) {
            return List.of();
        }
        return repository.findByDisciplinaIdInOrderByCriadoEmDesc(disciplinaIds).stream()
                .map(this::paraDto)
                .toList();
    }

    @Transactional
    public void excluir(Long id, Long professorId) {
        var material = repository.findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Material complementar", id));
        if (!material.getProfessor().getId().equals(professorId)) {
            throw ErrosSistema.OperacaoInvalidaException.com("Você não pode remover um material de outro professor.");
        }
        repository.delete(material);
    }
}
