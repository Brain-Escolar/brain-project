package br.com.brain.holerite;

import br.com.brain.arquivo.Arquivo;
import br.com.brain.arquivo.ArquivoRepository;
import br.com.brain.exception.ErrosSistema;
import br.com.brain.holerite.dto.CadastroHoleriteDto;
import br.com.brain.holerite.dto.ListagemHoleriteDto;
import br.com.brain.infra.aws.S3Service;
import br.com.brain.professor.Professor;
import br.com.brain.professor.ProfessorRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import java.time.Duration;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class HoleriteService {

    private final HoleriteRepository repository;
    private final ArquivoRepository arquivoRepository;
    private final ProfessorRepository professorRepository;
    private final S3Service s3Service;

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public Holerite cadastrar(CadastroHoleriteDto dados, MultipartFile arquivoContracheque) {
        var professor = em.getReference(Professor.class, dados.professorId());

        var arquivo = new Arquivo();
        String key = "holerites/" + UUID.randomUUID() + "-" + arquivoContracheque.getOriginalFilename();
        s3Service.upload(key, arquivoContracheque);
        arquivo.setS3Key(key);
        arquivo.setNomeOriginal(arquivoContracheque.getOriginalFilename());
        arquivo.setContentType(arquivoContracheque.getContentType());
        arquivo.setTamanho(arquivoContracheque.getSize());
        arquivoRepository.save(arquivo);

        var holerite = new Holerite();
        holerite.setProfessor(professor);
        holerite.setAno(dados.ano());
        holerite.setMes(dados.mes());
        holerite.setArquivo(arquivo);
        repository.save(holerite);
        return holerite;
    }

    public ListagemHoleriteDto paraDto(Holerite holerite) {
        String downloadUrl = s3Service.generatePresignedDownloadUrl(holerite.getArquivo().getS3Key(),
                Duration.ofMinutes(5));
        return new ListagemHoleriteDto(holerite, downloadUrl);
    }

    public List<ListagemHoleriteDto> listarPorProfessorLogado(Long dadosPessoaisId) {
        var professor = professorRepository.findByDadosPessoaisId(dadosPessoaisId)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Professor"));
        return repository.findByProfessorIdOrderByAnoDescMesDesc(professor.getId()).stream()
                .map(this::paraDto)
                .toList();
    }
}
