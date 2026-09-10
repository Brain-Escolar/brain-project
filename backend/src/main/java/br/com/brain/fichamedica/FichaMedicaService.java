package br.com.brain.fichamedica;

import br.com.brain.aluno.AlunoRepository;
import br.com.brain.arquivo.Arquivo;
import br.com.brain.arquivo.ArquivoRepository;
import br.com.brain.dadosPessoais.DadosPessoais;
import br.com.brain.laudoMedico.LaudoMedico;
import br.com.brain.laudoMedico.LaudoMedicoRepository;
import br.com.brain.medicacao.Medicacao;
import br.com.brain.medicacao.MedicacaoRepository;
import br.com.brain.medicacao.dto.CadastroMedicacaoDto;
import br.com.brain.medicacao.dto.ListagemMedicacaoDto;
import br.com.brain.arquivo.dto.ListagemArquivoDto;
import br.com.brain.fichamedica.dto.AtualizacaoFichaMedicaDto;
import br.com.brain.fichamedica.dto.CadastroFichaMedicaDto;
import br.com.brain.fichamedica.dto.DetalhamentoFichaMedicaDto;
import br.com.brain.fichamedica.dto.ListagemFichaMedicaDto;
import br.com.brain.enums.TipoSanguineo;
import br.com.brain.exception.ErrosSistema;
import br.com.brain.infra.aws.S3Service;
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
    private final MedicacaoRepository medicacaoRepository;

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
                fichaMedica.getDadosPessoais().getDataDeNascimento(),
                tipoSanguineo,
                fichaMedica.getNecessidadesEspeciais(),
                fichaMedica.getDoencasRespiratorias(),
                fichaMedica.getAlergiasAlimentares(),
                fichaMedica.getAlergiasMedicamentosas(),
                laudos,
                medicacaoRepository
                        .findByFichaMedicaIdAndAtivaTrueOrderByNomeAsc(fichaMedica.getId())
                        .stream()
                        .map(ListagemMedicacaoDto::new)
                        .toList());
    }

    /**
     * Recupera a ficha medica de um aluno, criando uma vazia se ainda nao
     * existir.
     *
     * O responsavel precisa poder anexar um laudo ou registrar uma medicacao
     * mesmo antes da secretaria ter preenchido a ficha — caso contrario a
     * primeira inclusao falharia com 404 e a familia nao teria como agir.
     */
    @Transactional
    public FichaMedica recuperarOuCriarPorAluno(Long alunoId) {
        var aluno = alunoRepository.findById(alunoId)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Aluno", alunoId));

        return repository.findByDadosPessoaisId(aluno.getDadosPessoais().getId())
                .orElseGet(() -> {
                    var ficha = new FichaMedica();
                    ficha.setDadosPessoais(aluno.getDadosPessoais());
                    return repository.save(ficha);
                });
    }

    /**
     * Inclui uma medicacao em uso. Nao ha remocao pelo responsavel de
     * proposito — ver a migration V99.
     */
    @Transactional
    public ListagemMedicacaoDto incluirMedicacao(Long alunoId, CadastroMedicacaoDto dados) {
        var ficha = recuperarOuCriarPorAluno(alunoId);

        var medicacao = new Medicacao();
        medicacao.setFichaMedica(ficha);
        medicacao.setNome(dados.nome());
        medicacao.setDosagem(dados.dosagem());
        medicacao.setHorario(dados.horario());
        medicacao.setObservacao(dados.observacao());
        medicacao.setAtiva(true);

        return new ListagemMedicacaoDto(medicacaoRepository.save(medicacao));
    }

    /** Anexa um laudo a ficha do aluno, reusando o mesmo caminho S3 do cadastro. */
    @Transactional
    public ListagemArquivoDto anexarLaudo(Long alunoId, MultipartFile arquivoEnviado) {
        var ficha = recuperarOuCriarPorAluno(alunoId);

        String key = "fichas-medicas/" + UUID.randomUUID() + "-" + arquivoEnviado.getOriginalFilename();
        s3Service.upload(key, arquivoEnviado);

        var arquivo = new Arquivo();
        arquivo.setS3Key(key);
        arquivo.setNomeOriginal(arquivoEnviado.getOriginalFilename());
        arquivo.setContentType(arquivoEnviado.getContentType());
        arquivo.setTamanho(arquivoEnviado.getSize());
        arquivoRepository.save(arquivo);

        var laudo = new LaudoMedico();
        laudo.setArquivo(arquivo);
        laudo.setFichaMedica(ficha);
        laudoMedicoRepository.save(laudo);

        var downloadUrl = s3Service.generatePresignedDownloadUrl(key, Duration.ofMinutes(5));
        return new ListagemArquivoDto(arquivo, downloadUrl);
    }
}
