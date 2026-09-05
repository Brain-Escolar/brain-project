package br.com.brain.crm;

import br.com.brain.aluno.Aluno;
import br.com.brain.aluno.AlunoRepository;
import br.com.brain.aluno.AlunoService;
import br.com.brain.aluno.dto.CadastroAlunoDto;
import br.com.brain.crm.dto.CadastroInteracaoDto;
import br.com.brain.crm.dto.CadastroLeadCrmDto;
import br.com.brain.crm.dto.CargaEquipeDto;
import br.com.brain.crm.dto.DetalhamentoProcessoCrmDto;
import br.com.brain.crm.dto.ListagemInteracaoDto;
import br.com.brain.crm.dto.ListagemProcessoCrmDto;
import br.com.brain.crm.dto.RelatorioCrmDto;
import br.com.brain.crm.dto.StepFunilDto;
import br.com.brain.dadosPessoais.DadosPessoais;
import br.com.brain.enums.StatusProcessoMatricula;
import br.com.brain.enums.TipoInteracao;
import br.com.brain.enums.TipoProcessoMatricula;
import br.com.brain.exception.ErrosSistema;
import br.com.brain.secretario.SecretarioRepository;
import br.com.brain.serie.Serie;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProcessoMatriculaService {

    private final ProcessoMatriculaRepository repository;
    private final HistoricoEstagioRepository historicoEstagioRepository;
    private final InteracaoRepository interacaoRepository;
    private final FunilEstagioRepository funilEstagioRepository;
    private final SecretarioRepository secretarioRepository;
    private final AlunoRepository alunoRepository;
    private final AlunoService alunoService;

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public ProcessoMatricula criarLead(CadastroLeadCrmDto dados) {
        var aluno = resolverAluno(dados);

        if (dados.serieId() != null) {
            aluno.setSerie(em.getReference(Serie.class, dados.serieId()));
            alunoRepository.save(aluno);
        }

        var processoAtivoExistente = repository.findByAlunoId(aluno.getId()).stream()
                .anyMatch(p -> p.getStatus() == StatusProcessoMatricula.ATIVO);
        if (processoAtivoExistente) {
            throw ErrosSistema.OperacaoInvalidaException.com("Este aluno já tem um processo de matrícula em andamento no CRM.");
        }

        var origem = em.getReference(OrigemLead.class, dados.origemId());
        var primeiroEstagio = funilEstagioRepository.findByOrdem(1)
                .orElseThrow(() -> ErrosSistema.OperacaoInvalidaException.com("Funil sem estágio inicial configurado."));

        var processo = new ProcessoMatricula();
        processo.setAluno(aluno);
        processo.setOrigem(origem);
        processo.setEstagioAtual(primeiroEstagio);
        processo.setTipo(dados.tipo());
        processo.setStatus(StatusProcessoMatricula.ATIVO);
        processo.setAnoLetivo(dados.anoLetivo());
        processo.setResponsavelNome(dados.responsavelNome());
        processo.setResponsavelTelefone(dados.responsavelTelefone());
        if (dados.funcionarioId() != null) {
            processo.setFuncionario(em.getReference(DadosPessoais.class, dados.funcionarioId()));
        }
        repository.save(processo);

        var historico = new HistoricoEstagio();
        historico.setProcesso(processo);
        historico.setEstagio(primeiroEstagio);
        historico.setDataEntrada(Instant.now());
        historicoEstagioRepository.save(historico);

        var interacao = new Interacao();
        interacao.setProcesso(processo);
        interacao.setTipo(TipoInteracao.SISTEMA);
        interacao.setResultado(origem.getNome());
        interacao.setObservacoes("Lead criado no CRM.");
        interacaoRepository.save(interacao);

        return processo;
    }

    /**
     * Resolve o aluno do novo processo: reaproveita um aluno já existente
     * (rematrícula — ele pode estar matriculado ou desmatriculado) quando vem
     * {@code alunoId}, ou cadastra um aluno novo com dado mínimo (nome + e-mail)
     * quando não vem — esse é o caminho de um lead de matrícula nova.
     */
    private Aluno resolverAluno(CadastroLeadCrmDto dados) {
        if (dados.alunoId() != null) {
            return alunoRepository.findById(dados.alunoId())
                    .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Aluno", dados.alunoId()));
        }

        if (dados.nomeAluno() == null || dados.nomeAluno().isBlank()
                || dados.email() == null || dados.email().isBlank()) {
            throw ErrosSistema.OperacaoInvalidaException
                    .com("Informe um aluno existente ou nome e e-mail para cadastrar um aluno novo.");
        }

        var alunoDto = new CadastroAlunoDto(null, null, dados.nomeAluno(), null, dados.email(), null, null, null,
                null, null, null, null);
        return alunoService.cadastrarAluno(alunoDto);
    }

    public List<ListagemProcessoCrmDto> listar(StatusProcessoMatricula status, Long funcionarioId, Boolean semDono,
            TipoProcessoMatricula tipo) {
        var processos = (status != null ? repository.findByStatus(status) : repository.findAll()).stream()
                .filter(p -> funcionarioId == null
                        || (p.getFuncionario() != null && p.getFuncionario().getId().equals(funcionarioId)))
                .filter(p -> semDono == null || (semDono ? p.getFuncionario() == null : p.getFuncionario() != null))
                .filter(p -> tipo == null || p.getTipo() == tipo)
                .toList();

        return processos.stream()
                .map(p -> new ListagemProcessoCrmDto(p, dataEntradaEstagioAtual(p.getId()), proximaAcao(p.getId())))
                .toList();
    }

    public DetalhamentoProcessoCrmDto detalhar(Long id) {
        var processo = buscar(id);

        var historicoProcesso = historicoEstagioRepository.findByProcessoIdOrderByDataEntradaAsc(id);
        Map<Long, Instant> dataEntradaPorEstagio = new HashMap<>();
        for (var h : historicoProcesso) {
            dataEntradaPorEstagio.putIfAbsent(h.getEstagio().getId(), h.getDataEntrada());
        }

        var estagios = funilEstagioRepository.findAllByOrderByOrdemAsc();
        var atual = processo.getEstagioAtual();
        List<StepFunilDto> steps = estagios.stream()
                .map(e -> new StepFunilDto(
                        e.getId(), e.getNome(), e.getOrdem(),
                        e.getOrdem() < atual.getOrdem(),
                        e.getId().equals(atual.getId()),
                        dataEntradaPorEstagio.get(e.getId())))
                .toList();

        var interacoes = interacaoRepository.findByProcessoIdOrderByCriadoEmDesc(id).stream()
                .map(ListagemInteracaoDto::new)
                .toList();

        return new DetalhamentoProcessoCrmDto(processo, steps, interacoes, processo.getAtualizadoEm());
    }

    @Transactional
    public ProcessoMatricula registrarInteracao(Long id, CadastroInteracaoDto dados, Long autorFuncionarioId) {
        var processo = buscar(id);

        var interacao = new Interacao();
        interacao.setProcesso(processo);
        if (autorFuncionarioId != null) {
            interacao.setFuncionario(em.getReference(DadosPessoais.class, autorFuncionarioId));
        }
        interacao.setTipo(dados.tipo());
        interacao.setResultado(dados.resultado());
        interacao.setObservacoes(dados.observacoes());
        interacao.setProximaAcao(dados.proximaAcao());
        interacaoRepository.save(interacao);

        if (dados.moverParaEstagioId() != null) {
            moverEstagio(processo, dados.moverParaEstagioId());
        }
        if (dados.subestagio() != null) {
            processo.setSubestagio(dados.subestagio());
        }
        repository.save(processo);

        return processo;
    }

    @Transactional
    public ProcessoMatricula avancarEstagio(Long id, Long autorFuncionarioId) {
        var processo = buscar(id);
        var proximo = funilEstagioRepository.findByOrdem(processo.getEstagioAtual().getOrdem() + 1)
                .orElseThrow(() -> ErrosSistema.OperacaoInvalidaException.com("Processo já está no último estágio do funil."));

        moverEstagio(processo, proximo.getId());

        var interacao = new Interacao();
        interacao.setProcesso(processo);
        if (autorFuncionarioId != null) {
            interacao.setFuncionario(em.getReference(DadosPessoais.class, autorFuncionarioId));
        }
        interacao.setTipo(TipoInteracao.SISTEMA);
        interacao.setResultado(proximo.getNome());
        interacao.setObservacoes("Processo movido para o estágio " + proximo.getNome() + ".");
        interacaoRepository.save(interacao);

        repository.save(processo);
        return processo;
    }

    @Transactional
    public ProcessoMatricula marcarPerdido(Long id, String motivo) {
        return concluirComStatus(id, StatusProcessoMatricula.PERDIDO, motivo);
    }

    @Transactional
    public ProcessoMatricula marcarDesistiu(Long id, String motivo) {
        return concluirComStatus(id, StatusProcessoMatricula.DESISTIU, motivo);
    }

    @Transactional
    public ProcessoMatricula reatribuir(Long id, Long funcionarioId) {
        var processo = buscar(id);
        processo.setFuncionario(em.getReference(DadosPessoais.class, funcionarioId));
        return repository.save(processo);
    }

    @Transactional
    public List<ProcessoMatricula> distribuirFila() {
        var pendentes = repository.findByStatusAndFuncionarioIsNullOrderByCriadoEmAsc(StatusProcessoMatricula.ATIVO);
        var secretarios = secretarioRepository.findAll();

        if (secretarios.isEmpty()) {
            throw ErrosSistema.OperacaoInvalidaException.com("Não há atendentes cadastrados para distribuir a fila.");
        }
        if (pendentes.isEmpty()) {
            return List.of();
        }

        record Carga(DadosPessoais funcionario, long[] contador) {
        }
        var cargas = secretarios.stream()
                .map(s -> new Carga(s.getDadosPessoais(),
                        new long[] { repository.countByStatusAndFuncionarioId(StatusProcessoMatricula.ATIVO,
                                s.getDadosPessoais().getId()) }))
                .sorted(Comparator.comparingLong((Carga c) -> c.contador()[0])
                        .thenComparing(c -> c.funcionario().getNome()))
                .toList();

        var atualizados = new ArrayList<ProcessoMatricula>();
        for (var processo : pendentes) {
            var escolhido = cargas.stream().min(Comparator.comparingLong((Carga c) -> c.contador()[0])
                    .thenComparing(c -> c.funcionario().getNome())).get();
            processo.setFuncionario(escolhido.funcionario());
            escolhido.contador()[0]++;
            atualizados.add(repository.save(processo));
        }
        return atualizados;
    }

    public List<CargaEquipeDto> equipe() {
        return secretarioRepository.findAll().stream()
                .map(s -> new CargaEquipeDto(
                        s.getDadosPessoais().getId(),
                        s.getDadosPessoais().getNome(),
                        repository.countByStatusAndFuncionarioId(StatusProcessoMatricula.ATIVO,
                                s.getDadosPessoais().getId())))
                .toList();
    }

    public RelatorioCrmDto relatorios(Integer anoLetivo) {
        var todos = repository.findAll().stream()
                .filter(p -> anoLetivo == null || anoLetivo.equals(p.getAnoLetivo()))
                .toList();

        int totalLeads = todos.size();
        var matriculados = todos.stream().filter(p -> p.getStatus() == StatusProcessoMatricula.MATRICULADO).toList();
        var perdidos = todos.stream()
                .filter(p -> p.getStatus() == StatusProcessoMatricula.PERDIDO
                        || p.getStatus() == StatusProcessoMatricula.DESISTIU)
                .toList();
        double conversao = totalLeads == 0 ? 0 : matriculados.size() * 100.0 / totalLeads;

        Double tempoMedioMatricula = media(matriculados.stream()
                .filter(p -> p.getDataConclusao() != null)
                .map(p -> (double) ChronoUnit.DAYS.between(p.getCriadoEm(), p.getDataConclusao())));

        Double tempoMedio1Contato = media(todos.stream()
                .map(p -> primeiraInteracaoHumana(p.getId()))
                .filter(i -> i != null)
                .map(par -> (double) ChronoUnit.DAYS.between(par.getKey(), par.getValue())));

        var estagios = funilEstagioRepository.findAllByOrderByOrdemAsc();
        var funil = estagios.stream().map(e -> {
            var historicoEstagio = historicoEstagioRepository.findByEstagioId(e.getId());
            long quantidade = historicoEstagio.stream().map(h -> h.getProcesso().getId()).distinct().count();
            Double tempoMedio = media(historicoEstagio.stream()
                    .filter(h -> h.getDataSaida() != null)
                    .map(h -> (double) ChronoUnit.DAYS.between(h.getDataEntrada(), h.getDataSaida())));
            return new RelatorioCrmDto.FunilEtapaRelatorioDto(e.getNome(), quantidade, tempoMedio);
        }).toList();

        Map<String, List<ProcessoMatricula>> porOrigem = todos.stream()
                .collect(Collectors.groupingBy(p -> p.getOrigem().getNome()));
        var origens = porOrigem.entrySet().stream()
                .map(entry -> {
                    long qtd = entry.getValue().size();
                    long qtdMatriculados = entry.getValue().stream()
                            .filter(p -> p.getStatus() == StatusProcessoMatricula.MATRICULADO).count();
                    return new RelatorioCrmDto.OrigemRelatorioDto(entry.getKey(), qtd,
                            qtd == 0 ? 0 : qtdMatriculados * 100.0 / qtd);
                })
                .sorted(Comparator.comparingLong(RelatorioCrmDto.OrigemRelatorioDto::quantidade).reversed())
                .toList();

        Map<String, Long> porMotivo = perdidos.stream()
                .filter(p -> p.getMotivoPerda() != null)
                .collect(Collectors.groupingBy(ProcessoMatricula::getMotivoPerda, Collectors.counting()));
        long totalComMotivo = porMotivo.values().stream().mapToLong(Long::longValue).sum();
        var motivosPerda = porMotivo.entrySet().stream()
                .map(entry -> new RelatorioCrmDto.MotivoPerdaRelatorioDto(entry.getKey(), entry.getValue(),
                        totalComMotivo == 0 ? 0 : entry.getValue() * 100.0 / totalComMotivo))
                .sorted(Comparator.comparingLong(RelatorioCrmDto.MotivoPerdaRelatorioDto::quantidade).reversed())
                .toList();

        return new RelatorioCrmDto(totalLeads, matriculados.size(), perdidos.size(), conversao, tempoMedioMatricula,
                tempoMedio1Contato, funil, origens, motivosPerda);
    }

    private Map.Entry<Instant, Instant> primeiraInteracaoHumana(Long processoId) {
        return interacaoRepository.findByProcessoIdOrderByCriadoEmDesc(processoId).stream()
                .filter(i -> i.getTipo() != TipoInteracao.SISTEMA)
                .min(Comparator.comparing(Interacao::getCriadoEm))
                .map(i -> Map.entry(i.getProcesso().getCriadoEm(), i.getCriadoEm()))
                .orElse(null);
    }

    private Double media(java.util.stream.Stream<Double> valores) {
        var lista = valores.toList();
        if (lista.isEmpty()) {
            return null;
        }
        return lista.stream().mapToDouble(Double::doubleValue).average().orElse(0);
    }

    private void moverEstagio(ProcessoMatricula processo, Long novoEstagioId) {
        var novoEstagio = funilEstagioRepository.findById(novoEstagioId)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Estágio do funil", novoEstagioId));

        historicoEstagioRepository.findByProcessoIdAndDataSaidaIsNull(processo.getId())
                .ifPresent(historico -> {
                    historico.setDataSaida(Instant.now());
                    historicoEstagioRepository.save(historico);
                });

        var novoHistorico = new HistoricoEstagio();
        novoHistorico.setProcesso(processo);
        novoHistorico.setEstagio(novoEstagio);
        novoHistorico.setDataEntrada(Instant.now());
        historicoEstagioRepository.save(novoHistorico);

        processo.setEstagioAtual(novoEstagio);
        processo.setSubestagio(null);

        var ultimoEstagio = funilEstagioRepository.findTopByOrderByOrdemDesc().orElse(null);
        if (ultimoEstagio != null && ultimoEstagio.getId().equals(novoEstagio.getId())) {
            processo.setStatus(StatusProcessoMatricula.MATRICULADO);
            processo.setDataConclusao(Instant.now());
        }
    }

    private ProcessoMatricula concluirComStatus(Long id, StatusProcessoMatricula status, String motivo) {
        var processo = buscar(id);
        processo.setStatus(status);
        processo.setMotivoPerda(motivo);
        processo.setDataConclusao(Instant.now());
        return repository.save(processo);
    }

    private Instant proximaAcao(Long processoId) {
        return interacaoRepository.findByProcessoIdOrderByCriadoEmDesc(processoId).stream()
                .map(Interacao::getProximaAcao)
                .filter(p -> p != null)
                .findFirst()
                .orElse(null);
    }

    private Instant dataEntradaEstagioAtual(Long processoId) {
        return historicoEstagioRepository.findByProcessoIdAndDataSaidaIsNull(processoId)
                .map(HistoricoEstagio::getDataEntrada)
                .orElse(null);
    }

    private ProcessoMatricula buscar(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Processo de matrícula", id));
    }
}
