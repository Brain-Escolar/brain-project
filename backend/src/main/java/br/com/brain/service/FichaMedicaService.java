package br.com.brain.service;

import br.com.brain.domain.aluno.AlunoRepository;
import br.com.brain.domain.arquivo.Arquivo;
import br.com.brain.domain.arquivo.ArquivoRepository;
import br.com.brain.domain.dadosPessoais.DadosPessoais;
import br.com.brain.domain.fichamedica.FichaMedica;
import br.com.brain.domain.fichamedica.FichaMedicaRepository;
import br.com.brain.domain.laudoMedico.LaudoMedico;
import br.com.brain.domain.laudoMedico.LaudoMedicoRepository;
import br.com.brain.dto.arquivo.ListagemArquivoDto;
import br.com.brain.dto.fichamedica.AtualizacaoFichaMedicaDto;
import br.com.brain.dto.fichamedica.CadastroFichaMedicaDto;
import br.com.brain.dto.fichamedica.DetalhamentoFichaMedicaDto;
import br.com.brain.dto.fichamedica.ListagemFichaMedicaDto;
import br.com.brain.enums.TipoSanguineo;
import br.com.brain.exception.ErrosSistema;
import br.com.brain.service.aws.S3Service;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import java.time.Duration;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class FichaMedicaService {

    private final FichaMedicaRepository repository;
    private final AlunoRepository alunoRepository;
    private final ArquivoRepository arquivoRepository;
    private final LaudoMedicoRepository laudoMedicoRepository;
    private final S3Service s3Service;

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public FichaMedica cadastrarFichaMedica(List<MultipartFile> laudos, CadastroFichaMedicaDto dados) {

        DadosPessoais dadosPessoais = em.getReference(DadosPessoais.class, dados.dadosPessoaisId());
        var fichaMedica = new FichaMedica();
        fichaMedica.setAlergiasAlimentares(dados.alergiasAlimentares());
        fichaMedica.setAlergiasMedicamentosas(dados.alergiasMedicamentosas());
        fichaMedica.setDadosPessoais(dadosPessoais);
        fichaMedica.setDoencasRespiratorias(dados.doencasRespiratorias());
        fichaMedica.setNecessidadesEspeciais(dados.necessidadesEspeciais());
        if (dados.tipoSanguineo() != null && !dados.tipoSanguineo().isEmpty()) {
            fichaMedica.setTipoSanguineo(TipoSanguineo.valueOf(dados.tipoSanguineo()));
        }

        for (var laudo : laudos) {
            String key = "fichas-medicas/" + UUID.randomUUID() + "-" + laudo.getOriginalFilename();
            s3Service.upload(key, laudo);

            var laudoMedico = new LaudoMedico();
            var arquivo = new Arquivo();
            arquivo.setS3Key(key);
            arquivo.setNomeOriginal(laudo.getOriginalFilename());
            arquivo.setContentType(laudo.getContentType());
            arquivo.setTamanho(laudo.getSize());
            arquivoRepository.save(arquivo);

            laudoMedico.setArquivo(arquivo);
            laudoMedico.setFichaMedica(fichaMedica);

            fichaMedica.getLaudos().add(laudoMedico);
        }

        repository.save(fichaMedica);

        return fichaMedica;
    }

    public Page<ListagemFichaMedicaDto> listar(Pageable paginacao) {
        return repository.findAll(paginacao).map(ListagemFichaMedicaDto::new);
    }

    @Transactional
    public FichaMedica atualizar(AtualizacaoFichaMedicaDto dados, Long id) {
        var fichaMedica = repository.findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("FichaMedica", id));

        if (dados.alergiasAlimentares() != null) {
            fichaMedica.setAlergiasAlimentares(dados.alergiasAlimentares());
        }
        if (dados.alergiasMedicamentosas() != null) {
            fichaMedica.setAlergiasMedicamentosas(dados.alergiasMedicamentosas());
        }
        if (dados.doencasRespiratorias() != null) {
            fichaMedica.setDoencasRespiratorias(dados.doencasRespiratorias());
        }
        if (dados.tipoSanguineo() != null) {
            fichaMedica.setTipoSanguineo(TipoSanguineo.valueOf(dados.tipoSanguineo()));
        }
        if (dados.necessidadesEspeciais() != null) {
            fichaMedica.setNecessidadesEspeciais(dados.necessidadesEspeciais());
        }

        repository.save(fichaMedica);

        return fichaMedica;
    }

    public FichaMedica detalhar(Long id) {
        return repository.findById(id).get();
    }

    public Page<ListagemArquivoDto> listarLaudos(Pageable paginacao) {
        return laudoMedicoRepository.findAll(paginacao).map(laudo -> {
            String downloadUrl = s3Service.generatePresignedDownloadUrl(laudo.getArquivo().getS3Key(),
                    Duration.ofMinutes(5));
            return new ListagemArquivoDto(laudo.getArquivo(), downloadUrl);
        });
    }

    public DetalhamentoFichaMedicaDto buscarPorAluno(Long alunoId) {
        var aluno = alunoRepository.findById(alunoId)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Aluno", alunoId));
        var fichaMedica = repository.findByDadosPessoaisId(aluno.getDadosPessoais().getId())
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("FichaMedica do aluno", alunoId));

        var laudos = fichaMedica.getLaudos().stream().map(laudo -> {
            String downloadUrl = s3Service.generatePresignedDownloadUrl(laudo.getArquivo().getS3Key(),
                    Duration.ofMinutes(5));
            return new ListagemArquivoDto(laudo.getArquivo(), downloadUrl);
        }).toList();

        var tipoSanguineo = fichaMedica.getTipoSanguineo() != null
                ? fichaMedica.getTipoSanguineo().getTipo()
                : null;

        return new DetalhamentoFichaMedicaDto(
                fichaMedica.getId(),
                fichaMedica.getDadosPessoais().getNome(),
                tipoSanguineo,
                fichaMedica.getNecessidadesEspeciais(),
                fichaMedica.getDoencasRespiratorias(),
                fichaMedica.getAlergiasAlimentares(),
                fichaMedica.getAlergiasMedicamentosas(),
                laudos);
    }
}
