package br.com.brain.informerendimento;

import br.com.brain.arquivo.Arquivo;
import br.com.brain.arquivo.ArquivoRepository;
import br.com.brain.exception.ErrosSistema;
import br.com.brain.infra.aws.S3Service;
import br.com.brain.informerendimento.dto.CadastroInformeRendimentoDto;
import br.com.brain.informerendimento.dto.ListagemInformeRendimentoDto;
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
public class InformeRendimentoService {

    private final InformeRendimentoRepository repository;
    private final ArquivoRepository arquivoRepository;
    private final ProfessorRepository professorRepository;
    private final S3Service s3Service;

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public InformeRendimento cadastrar(CadastroInformeRendimentoDto dados, MultipartFile arquivoInforme) {
        var professor = em.getReference(Professor.class, dados.professorId());

        var arquivo = new Arquivo();
        String key = "informes-rendimento/" + UUID.randomUUID() + "-" + arquivoInforme.getOriginalFilename();
        s3Service.upload(key, arquivoInforme);
        arquivo.setS3Key(key);
        arquivo.setNomeOriginal(arquivoInforme.getOriginalFilename());
        arquivo.setContentType(arquivoInforme.getContentType());
        arquivo.setTamanho(arquivoInforme.getSize());
        arquivoRepository.save(arquivo);

        var informe = new InformeRendimento();
        informe.setProfessor(professor);
        informe.setAno(dados.ano());
        informe.setMesesConsiderados(dados.mesesConsiderados());
        informe.setCompleto(dados.completo() != null ? dados.completo() : true);
        informe.setArquivo(arquivo);
        repository.save(informe);
        return informe;
    }

    public ListagemInformeRendimentoDto paraDto(InformeRendimento informe) {
        String downloadUrl = s3Service.generatePresignedDownloadUrl(informe.getArquivo().getS3Key(),
                Duration.ofMinutes(5));
        return new ListagemInformeRendimentoDto(informe, downloadUrl);
    }

    public List<ListagemInformeRendimentoDto> listarPorProfessorLogado(Long dadosPessoaisId) {
        var professor = professorRepository.findByDadosPessoaisId(dadosPessoaisId)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Professor"));
        return repository.findByProfessorIdOrderByAnoDesc(professor.getId()).stream()
                .map(this::paraDto)
                .toList();
    }
}
