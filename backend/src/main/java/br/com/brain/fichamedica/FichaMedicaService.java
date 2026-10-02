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
import br.com.brain.fichamedica.dto.CadastroLaudoDto;
import br.com.brain.fichamedica.dto.LaudoMedicoDto;
import br.com.brain.fichamedica.dto.DetalhamentoFichaMedicaDto;
import br.com.brain.fichamedica.dto.ListagemFichaMedicaDto;
import br.com.brain.enums.TipoLaudo;
import br.com.brain.enums.TipoSanguineo;
import br.com.brain.enums.TipoUsoMedicacao;
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
    private final MedicacaoRepository medicacaoRepository;
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

        if (laudos != null) {
            for (var laudo : laudos) {
                var laudoMedico = new LaudoMedico();
                laudoMedico.setArquivo(salvarArquivo(laudo, "fichas-medicas/laudos/"));
                laudoMedico.setFichaMedica(fichaMedica);
                laudoMedico.setTipo(TipoLaudo.OUTRO);

                fichaMedica.getLaudos().add(laudoMedico);
            }
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

        aplicarDados(fichaMedica, dados);

        repository.save(fichaMedica);

        return fichaMedica;
    }

    public FichaMedica detalhar(Long id) {
        return repository.findById(id).get();
    }

    public Page<ListagemArquivoDto> listarLaudos(Long fichaMedicaId, Pageable paginacao) {
        return laudoMedicoRepository.findByFichaMedicaId(fichaMedicaId, paginacao)
                .map(laudo -> new ListagemArquivoDto(laudo.getArquivo(), urlDownload(laudo.getArquivo())));
    }

    public DetalhamentoFichaMedicaDto buscarPorAluno(Long alunoId) {
        var aluno = alunoRepository.findById(alunoId)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Aluno", alunoId));
        var fichaMedica = repository.findByDadosPessoaisId(aluno.getDadosPessoais().getId())
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("FichaMedica do aluno", alunoId));

        return montarDetalhamento(fichaMedica);
    }

    /**
     * Recupera a ficha medica de um aluno, criando uma vazia se ainda nao
     * existir.
     *
     * O responsavel precisa poder anexar um laudo ou registrar uma medicacao
     * mesmo antes da secretaria ter preenchido a ficha — caso contrario a
     * primeira inclusao falharia com 404 e a familia nao teria como agir. Pelo
     * mesmo motivo a aba de ficha médica funciona para aluno sem cadastro
     * clínico prévio.
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
     * Inclui uma medicacao em uso pelo portal do responsavel. Nao ha remocao
     * pelo responsavel de proposito — ver a migration V99.
     */
    @Transactional
    public ListagemMedicacaoDto incluirMedicacao(Long alunoId, CadastroMedicacaoDto dados) {
        var medicacao = novaMedicacao(recuperarOuCriarPorAluno(alunoId), dados, null);
        return new ListagemMedicacaoDto(medicacao, urlDownload(medicacao.getArquivo()));
    }

    /**
     * Anexa um laudo enviado pelo responsavel no portal. A familia nao
     * classifica o laudo: ele entra como OUTRO, o valor neutro do enum.
     */
    @Transactional
    public ListagemArquivoDto anexarLaudo(Long alunoId, MultipartFile arquivoEnviado) {
        var ficha = recuperarOuCriarPorAluno(alunoId);

        var laudo = new LaudoMedico();
        laudo.setFichaMedica(ficha);
        laudo.setTipo(TipoLaudo.OUTRO);
        laudo.setArquivo(salvarArquivo(arquivoEnviado, "fichas-medicas/laudos/"));
        laudoMedicoRepository.save(laudo);

        return new ListagemArquivoDto(laudo.getArquivo(), urlDownload(laudo.getArquivo()));
    }

    /** Anexa um laudo já classificado por tipo, com observação. */
    @Transactional
    public DetalhamentoFichaMedicaDto anexarLaudo(Long alunoId, MultipartFile arquivo, CadastroLaudoDto dados) {
        var fichaMedica = recuperarOuCriarPorAluno(alunoId);

        var laudo = new LaudoMedico();
        laudo.setFichaMedica(fichaMedica);
        laudo.setTipo(TipoLaudo.valueOf(dados.tipo()));
        laudo.setObservacao(dados.observacao());
        laudo.setArquivo(salvarArquivo(arquivo, "fichas-medicas/laudos/"));

        fichaMedica.getLaudos().add(laudo);
        repository.save(fichaMedica);

        return montarDetalhamento(fichaMedica);
    }

    @Transactional
    public DetalhamentoFichaMedicaDto removerLaudo(Long alunoId, Long laudoId) {
        var fichaMedica = recuperarOuCriarPorAluno(alunoId);
        var laudo = laudoMedicoRepository.findById(laudoId)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("LaudoMedico", laudoId));

        validarPertenceAFicha(laudo.getFichaMedica().getId(), fichaMedica.getId(), "LaudoMedico", laudoId);

        fichaMedica.getLaudos().remove(laudo);
        repository.save(fichaMedica);

        return montarDetalhamento(fichaMedica);
    }

    @Transactional
    public DetalhamentoFichaMedicaDto anexarMedicacao(Long alunoId, MultipartFile receita,
            CadastroMedicacaoDto dados) {
        var fichaMedica = recuperarOuCriarPorAluno(alunoId);
        novaMedicacao(fichaMedica, dados, receita);

        return montarDetalhamento(fichaMedica);
    }

    @Transactional
    public DetalhamentoFichaMedicaDto atualizarMedicacao(Long alunoId, Long medicacaoId,
            CadastroMedicacaoDto dados) {
        var fichaMedica = recuperarOuCriarPorAluno(alunoId);
        var medicacao = medicacaoRepository.findById(medicacaoId)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Medicacao", medicacaoId));

        validarPertenceAFicha(medicacao.getFichaMedica().getId(), fichaMedica.getId(), "Medicacao", medicacaoId);

        aplicarDados(medicacao, dados);
        medicacaoRepository.save(medicacao);

        return montarDetalhamento(fichaMedica);
    }

    /**
     * Tira a medicação da ficha sem apagar o registro: é histórico de saúde de
     * menor. A ficha só lista as ativas.
     */
    @Transactional
    public DetalhamentoFichaMedicaDto desativarMedicacao(Long alunoId, Long medicacaoId) {
        var fichaMedica = recuperarOuCriarPorAluno(alunoId);
        var medicacao = medicacaoRepository.findById(medicacaoId)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Medicacao", medicacaoId));

        validarPertenceAFicha(medicacao.getFichaMedica().getId(), fichaMedica.getId(), "Medicacao", medicacaoId);

        medicacao.setAtiva(false);
        medicacaoRepository.save(medicacao);

        return montarDetalhamento(fichaMedica);
    }

    /** Dados clínicos e alergias — as alergias seguem nas colunas da própria ficha. */
    @Transactional
    public DetalhamentoFichaMedicaDto atualizarPorAluno(Long alunoId, AtualizacaoFichaMedicaDto dados) {
        var fichaMedica = recuperarOuCriarPorAluno(alunoId);
        aplicarDados(fichaMedica, dados);
        repository.save(fichaMedica);

        return montarDetalhamento(fichaMedica);
    }

    // ─── Apoio ───────────────────────────────────────────────────────────────

    private void validarPertenceAFicha(Long fichaDoRegistro, Long fichaEsperada, String recurso, Long recursoId) {
        if (!fichaEsperada.equals(fichaDoRegistro)) {
            throw ErrosSistema.RecursoNaoEncontradoException.para(recurso, recursoId);
        }
    }

    private Arquivo salvarArquivo(MultipartFile file, String prefixo) {
        String key = prefixo + UUID.randomUUID() + "-" + file.getOriginalFilename();
        s3Service.upload(key, file);

        var arquivo = new Arquivo();
        arquivo.setS3Key(key);
        arquivo.setNomeOriginal(file.getOriginalFilename());
        arquivo.setContentType(file.getContentType());
        arquivo.setTamanho(file.getSize());

        return arquivoRepository.save(arquivo);
    }

    private Medicacao novaMedicacao(FichaMedica fichaMedica, CadastroMedicacaoDto dados, MultipartFile receita) {
        var medicacao = new Medicacao();
        medicacao.setFichaMedica(fichaMedica);
        medicacao.setAtiva(true);
        aplicarDados(medicacao, dados);
        if (receita != null && !receita.isEmpty()) {
            medicacao.setArquivo(salvarArquivo(receita, "fichas-medicas/receitas/"));
        }

        return medicacaoRepository.save(medicacao);
    }

    private void aplicarDados(Medicacao medicacao, CadastroMedicacaoDto dados) {
        // O portal não envia tipo de uso — classificar é da escola.
        var tipoUso = dados.tipoUso() == null || dados.tipoUso().isBlank()
                ? null
                : TipoUsoMedicacao.valueOf(dados.tipoUso());
        medicacao.setNome(dados.nome());
        medicacao.setDosagem(dados.dosagem());
        medicacao.setHorario(dados.horario());
        medicacao.setObservacao(dados.observacao());
        medicacao.setTipoUso(tipoUso);
        // Uso contínuo não tem janela de administração; limpar evita datas órfãs
        // de um registro que era por período e passou a ser contínuo.
        medicacao.setDataInicio(tipoUso == TipoUsoMedicacao.CONTINUO ? null : dados.dataInicio());
        medicacao.setDataFim(tipoUso == TipoUsoMedicacao.CONTINUO ? null : dados.dataFim());
    }

    private void aplicarDados(FichaMedica fichaMedica, AtualizacaoFichaMedicaDto dados) {
        if (dados.alergiasAlimentares() != null) {
            fichaMedica.setAlergiasAlimentares(dados.alergiasAlimentares());
        }
        if (dados.alergiasMedicamentosas() != null) {
            fichaMedica.setAlergiasMedicamentosas(dados.alergiasMedicamentosas());
        }
        if (dados.doencasRespiratorias() != null) {
            fichaMedica.setDoencasRespiratorias(dados.doencasRespiratorias());
        }
        if (dados.tipoSanguineo() != null && !dados.tipoSanguineo().isEmpty()) {
            fichaMedica.setTipoSanguineo(TipoSanguineo.valueOf(dados.tipoSanguineo()));
        }
        if (dados.necessidadesEspeciais() != null) {
            fichaMedica.setNecessidadesEspeciais(dados.necessidadesEspeciais());
        }
    }

    private DetalhamentoFichaMedicaDto montarDetalhamento(FichaMedica fichaMedica) {
        var laudos = fichaMedica.getLaudos().stream()
                .map(laudo -> new LaudoMedicoDto(laudo, urlDownload(laudo.getArquivo())))
                .toList();

        var medicacoes = medicacaoRepository
                .findByFichaMedicaIdAndAtivaTrueOrderByNomeAsc(fichaMedica.getId())
                .stream()
                .map(medicacao -> new ListagemMedicacaoDto(medicacao, urlDownload(medicacao.getArquivo())))
                .toList();

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
                medicacoes);
    }

    private String urlDownload(Arquivo arquivo) {
        if (arquivo == null) {
            return null;
        }
        return s3Service.generatePresignedDownloadUrl(arquivo.getS3Key(), Duration.ofMinutes(5));
    }
}
