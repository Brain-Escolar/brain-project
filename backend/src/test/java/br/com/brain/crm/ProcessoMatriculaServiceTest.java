package br.com.brain.crm;

import br.com.brain.aluno.Aluno;
import br.com.brain.aluno.AlunoRepository;
import br.com.brain.aluno.AlunoService;
import br.com.brain.crm.dto.CadastroInteracaoDto;
import br.com.brain.crm.dto.CadastroLeadCrmDto;
import br.com.brain.dadosPessoais.DadosPessoais;
import br.com.brain.enums.StatusProcessoMatricula;
import br.com.brain.enums.TipoInteracao;
import br.com.brain.enums.TipoProcessoMatricula;
import br.com.brain.exception.ErrosSistema.OperacaoInvalidaException;
import br.com.brain.secretario.Secretario;
import br.com.brain.secretario.SecretarioRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.within;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * O funil e a fila de distribuicao sao a parte do CRM onde um bug fica invisivel
 * ate alguem reclamar que um lead sumiu ou que a distribuicao ficou injusta.
 * Cada teste aqui cobre uma transicao ou calculo que nao pode sair errado.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("ProcessoMatriculaService")
class ProcessoMatriculaServiceTest {

    @Mock
    private ProcessoMatriculaRepository repository;
    @Mock
    private HistoricoEstagioRepository historicoEstagioRepository;
    @Mock
    private InteracaoRepository interacaoRepository;
    @Mock
    private FunilEstagioRepository funilEstagioRepository;
    @Mock
    private SecretarioRepository secretarioRepository;
    @Mock
    private AlunoRepository alunoRepository;
    @Mock
    private AlunoService alunoService;
    @Mock
    private EntityManager em;

    private ProcessoMatriculaService service;

    private FunilEstagio estagio(Long id, String nome, int ordem) {
        var e = new FunilEstagio();
        e.setId(id);
        e.setNome(nome);
        e.setOrdem(ordem);
        return e;
    }

    private DadosPessoais dadosPessoais(Long id, String nome) {
        var d = new DadosPessoais();
        d.setId(id);
        d.setNome(nome);
        return d;
    }

    /**
     * Mock em vez de `new Secretario()` + setDadosPessoais: a entidade e
     * bytecode-enhanced pelo Hibernate para gerenciar a associacao bidirecional
     * com DadosPessoais, o que quebra (ClassCastException) quando o setter roda
     * fora de uma sessao de persistencia real.
     */
    private Secretario secretario(Long dadosPessoaisId, String nome) {
        var s = mock(Secretario.class);
        lenient().when(s.getDadosPessoais()).thenReturn(dadosPessoais(dadosPessoaisId, nome));
        return s;
    }

    @BeforeEach
    void setUp() {
        // Servico e montado a mao (nao @InjectMocks): o campo `em`, injetado via
        // @PersistenceContext em vez do construtor, nao e alcancado pela
        // injecao por construtor do Mockito.
        service = new ProcessoMatriculaService(repository, historicoEstagioRepository, interacaoRepository,
                funilEstagioRepository, secretarioRepository, alunoRepository, alunoService);
        ReflectionTestUtils.setField(service, "em", em);

        lenient().when(repository.save(any(ProcessoMatricula.class))).thenAnswer(inv -> inv.getArgument(0));
        lenient().when(historicoEstagioRepository.save(any(HistoricoEstagio.class))).thenAnswer(inv -> inv.getArgument(0));
        lenient().when(interacaoRepository.save(any(Interacao.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    // ---------------------------------------------------------------- criarLead

    @Test
    @DisplayName("criarLead: cria processo no primeiro estagio, sem serie nem funcionario")
    void criarLeadSemSerieSemFuncionario() {
        var aluno = new Aluno();
        aluno.setId(1L);
        var origem = new OrigemLead();
        origem.setId(5L);
        origem.setNome("Campanha Instagram");
        var primeiroEstagio = estagio(1L, "Novo lead", 1);

        when(alunoService.cadastrarAluno(any())).thenReturn(aluno);
        when(em.getReference(OrigemLead.class, 5L)).thenReturn(origem);
        when(funilEstagioRepository.findByOrdem(1)).thenReturn(Optional.of(primeiroEstagio));

        var dados = new CadastroLeadCrmDto(null, "Fulano", "fulano@escola.com", null, 2027,
                TipoProcessoMatricula.NOVA, 5L, "Mae do Fulano", "11999990000", null);

        var processo = service.criarLead(dados);

        assertThat(processo.getAluno()).isSameAs(aluno);
        assertThat(processo.getOrigem()).isSameAs(origem);
        assertThat(processo.getEstagioAtual()).isSameAs(primeiroEstagio);
        assertThat(processo.getTipo()).isEqualTo(TipoProcessoMatricula.NOVA);
        assertThat(processo.getStatus()).isEqualTo(StatusProcessoMatricula.ATIVO);
        assertThat(processo.getAnoLetivo()).isEqualTo(2027);
        assertThat(processo.getResponsavelNome()).isEqualTo("Mae do Fulano");
        assertThat(processo.getFuncionario()).isNull();

        verify(alunoRepository, never()).save(any());

        var historicoCaptor = ArgumentCaptor.forClass(HistoricoEstagio.class);
        verify(historicoEstagioRepository).save(historicoCaptor.capture());
        assertThat(historicoCaptor.getValue().getEstagio()).isSameAs(primeiroEstagio);
        assertThat(historicoCaptor.getValue().getDataEntrada()).isCloseTo(Instant.now(), within(5, ChronoUnit.SECONDS));

        var interacaoCaptor = ArgumentCaptor.forClass(Interacao.class);
        verify(interacaoRepository).save(interacaoCaptor.capture());
        assertThat(interacaoCaptor.getValue().getTipo()).isEqualTo(TipoInteracao.SISTEMA);
        assertThat(interacaoCaptor.getValue().getResultado()).isEqualTo("Campanha Instagram");
    }

    @Test
    @DisplayName("criarLead: com serie e funcionario, vincula ambos e salva o aluno")
    void criarLeadComSerieEFuncionario() {
        var aluno = new Aluno();
        aluno.setId(2L);
        var origem = new OrigemLead();
        origem.setId(5L);
        origem.setNome("Indicacao");
        var primeiroEstagio = estagio(1L, "Novo lead", 1);
        var serie = new br.com.brain.serie.Serie();
        serie.setId(9L);
        var funcionario = dadosPessoais(42L, "Carla Nunes");

        when(alunoService.cadastrarAluno(any())).thenReturn(aluno);
        when(em.getReference(br.com.brain.serie.Serie.class, 9L)).thenReturn(serie);
        when(em.getReference(OrigemLead.class, 5L)).thenReturn(origem);
        when(em.getReference(DadosPessoais.class, 42L)).thenReturn(funcionario);
        when(funilEstagioRepository.findByOrdem(1)).thenReturn(Optional.of(primeiroEstagio));
        when(alunoRepository.save(any(Aluno.class))).thenAnswer(inv -> inv.getArgument(0));

        var dados = new CadastroLeadCrmDto(null, "Beltrana", "beltrana@escola.com", 9L, 2027,
                TipoProcessoMatricula.REMATRICULA, 5L, null, null, 42L);

        var processo = service.criarLead(dados);

        assertThat(aluno.getSerie()).isSameAs(serie);
        verify(alunoRepository).save(aluno);
        assertThat(processo.getFuncionario()).isSameAs(funcionario);
    }

    @Test
    @DisplayName("criarLead: sem estagio inicial configurado, lanca OperacaoInvalidaException")
    void criarLeadSemEstagioInicialConfigurado() {
        when(alunoService.cadastrarAluno(any())).thenReturn(new Aluno());
        when(funilEstagioRepository.findByOrdem(1)).thenReturn(Optional.empty());

        var dados = new CadastroLeadCrmDto(null, "Fulano", "fulano@escola.com", null, 2027,
                TipoProcessoMatricula.NOVA, 5L, null, null, null);

        assertThatThrownBy(() -> service.criarLead(dados))
                .isInstanceOf(OperacaoInvalidaException.class);
    }

    @Test
    @DisplayName("criarLead: com alunoId, reaproveita o aluno existente em vez de cadastrar um novo")
    void criarLeadComAlunoExistenteReaproveitaAluno() {
        var alunoExistente = new Aluno();
        alunoExistente.setId(7L);
        var origem = new OrigemLead();
        origem.setId(5L);
        origem.setNome("Rematrícula (base)");
        var primeiroEstagio = estagio(1L, "Novo lead", 1);

        when(alunoRepository.findById(7L)).thenReturn(Optional.of(alunoExistente));
        when(repository.findByAlunoId(7L)).thenReturn(List.of());
        when(em.getReference(OrigemLead.class, 5L)).thenReturn(origem);
        when(funilEstagioRepository.findByOrdem(1)).thenReturn(Optional.of(primeiroEstagio));

        var dados = new CadastroLeadCrmDto(7L, null, null, null, 2027,
                TipoProcessoMatricula.REMATRICULA, 5L, null, null, null);

        var processo = service.criarLead(dados);

        assertThat(processo.getAluno()).isSameAs(alunoExistente);
        verify(alunoService, never()).cadastrarAluno(any());
    }

    @Test
    @DisplayName("criarLead: aluno existente com processo ja ativo no CRM, lanca OperacaoInvalidaException")
    void criarLeadComAlunoJaTemProcessoAtivo() {
        var alunoExistente = new Aluno();
        alunoExistente.setId(7L);
        var processoAtivo = new ProcessoMatricula();
        processoAtivo.setStatus(StatusProcessoMatricula.ATIVO);

        when(alunoRepository.findById(7L)).thenReturn(Optional.of(alunoExistente));
        when(repository.findByAlunoId(7L)).thenReturn(List.of(processoAtivo));

        var dados = new CadastroLeadCrmDto(7L, null, null, null, 2027,
                TipoProcessoMatricula.REMATRICULA, 5L, null, null, null);

        assertThatThrownBy(() -> service.criarLead(dados))
                .isInstanceOf(OperacaoInvalidaException.class);

        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("criarLead: sem alunoId e sem nome/email, lanca OperacaoInvalidaException")
    void criarLeadSemAlunoIdSemNomeOuEmail() {
        var dados = new CadastroLeadCrmDto(null, null, null, null, 2027,
                TipoProcessoMatricula.NOVA, 5L, null, null, null);

        assertThatThrownBy(() -> service.criarLead(dados))
                .isInstanceOf(OperacaoInvalidaException.class);

        verify(alunoService, never()).cadastrarAluno(any());
    }

    // ---------------------------------------------------------- registrarInteracao

    @Test
    @DisplayName("registrarInteracao: sem mover estagio, so grava a interacao")
    void registrarInteracaoSemMoverEstagio() {
        var estagioAtual = estagio(2L, "Contato inicial", 2);
        var processo = new ProcessoMatricula();
        processo.setId(10L);
        processo.setEstagioAtual(estagioAtual);
        processo.setStatus(StatusProcessoMatricula.ATIVO);

        var autor = dadosPessoais(99L, "Carla Nunes");
        when(repository.findById(10L)).thenReturn(Optional.of(processo));
        when(em.getReference(DadosPessoais.class, 99L)).thenReturn(autor);

        var dados = new CadastroInteracaoDto(TipoInteracao.LIGACAO, "Atendeu", "Confirmou interesse", null, null, null);

        service.registrarInteracao(10L, dados, 99L);

        var captor = ArgumentCaptor.forClass(Interacao.class);
        verify(interacaoRepository).save(captor.capture());
        assertThat(captor.getValue().getTipo()).isEqualTo(TipoInteracao.LIGACAO);
        assertThat(captor.getValue().getResultado()).isEqualTo("Atendeu");
        assertThat(captor.getValue().getFuncionario()).isSameAs(autor);

        assertThat(processo.getEstagioAtual()).isSameAs(estagioAtual);
        verify(historicoEstagioRepository, never()).findByProcessoIdAndDataSaidaIsNull(anyLong());
        verify(repository).save(processo);
    }

    @Test
    @DisplayName("registrarInteracao: movendo de estagio, fecha o historico aberto e abre um novo")
    void registrarInteracaoMovendoDeEstagio() {
        var estagioAtual = estagio(2L, "Contato inicial", 2);
        var novoEstagio = estagio(3L, "Qualificacao", 3);
        var ultimoEstagio = estagio(7L, "Matriculado", 7);
        var processo = new ProcessoMatricula();
        processo.setId(10L);
        processo.setEstagioAtual(estagioAtual);
        processo.setStatus(StatusProcessoMatricula.ATIVO);

        var historicoAberto = new HistoricoEstagio();
        historicoAberto.setEstagio(estagioAtual);
        historicoAberto.setDataEntrada(Instant.now().minus(3, ChronoUnit.DAYS));

        when(repository.findById(10L)).thenReturn(Optional.of(processo));
        when(historicoEstagioRepository.findByProcessoIdAndDataSaidaIsNull(10L))
                .thenReturn(Optional.of(historicoAberto));
        when(funilEstagioRepository.findById(3L)).thenReturn(Optional.of(novoEstagio));
        when(funilEstagioRepository.findTopByOrderByOrdemDesc()).thenReturn(Optional.of(ultimoEstagio));

        var dados = new CadastroInteracaoDto(TipoInteracao.LIGACAO, "Reagendar", null, null, 3L, null);

        service.registrarInteracao(10L, dados, null);

        assertThat(historicoAberto.getDataSaida()).isNotNull();
        assertThat(processo.getEstagioAtual()).isSameAs(novoEstagio);
        assertThat(processo.getSubestagio()).isNull();
        assertThat(processo.getStatus()).isEqualTo(StatusProcessoMatricula.ATIVO);

        var novoHistoricoCaptor = ArgumentCaptor.forClass(HistoricoEstagio.class);
        verify(historicoEstagioRepository, times(2)).save(novoHistoricoCaptor.capture());
        assertThat(novoHistoricoCaptor.getAllValues().get(1).getEstagio()).isSameAs(novoEstagio);
    }

    @Test
    @DisplayName("registrarInteracao: movendo para o ultimo estagio, marca o processo como matriculado")
    void registrarInteracaoMovendoParaUltimoEstagioMarcaMatriculado() {
        var estagioAtual = estagio(6L, "Documentacao", 6);
        var ultimoEstagio = estagio(7L, "Matriculado", 7);
        var processo = new ProcessoMatricula();
        processo.setId(10L);
        processo.setEstagioAtual(estagioAtual);
        processo.setStatus(StatusProcessoMatricula.ATIVO);

        when(repository.findById(10L)).thenReturn(Optional.of(processo));
        when(historicoEstagioRepository.findByProcessoIdAndDataSaidaIsNull(10L)).thenReturn(Optional.empty());
        when(funilEstagioRepository.findById(7L)).thenReturn(Optional.of(ultimoEstagio));
        when(funilEstagioRepository.findTopByOrderByOrdemDesc()).thenReturn(Optional.of(ultimoEstagio));

        var dados = new CadastroInteracaoDto(TipoInteracao.ANOTACAO, null, null, null, 7L, null);

        service.registrarInteracao(10L, dados, null);

        assertThat(processo.getStatus()).isEqualTo(StatusProcessoMatricula.MATRICULADO);
        assertThat(processo.getDataConclusao()).isNotNull();
    }

    @Test
    @DisplayName("registrarInteracao: com subestagio informado, atualiza o subestagio do processo")
    void registrarInteracaoComSubestagio() {
        var processo = new ProcessoMatricula();
        processo.setId(10L);
        processo.setEstagioAtual(estagio(2L, "Contato inicial", 2));

        when(repository.findById(10L)).thenReturn(Optional.of(processo));

        var dados = new CadastroInteracaoDto(TipoInteracao.WHATSAPP, null, null, null, null, "2a tentativa");

        service.registrarInteracao(10L, dados, null);

        assertThat(processo.getSubestagio()).isEqualTo("2a tentativa");
    }

    // -------------------------------------------------------------- avancarEstagio

    @Test
    @DisplayName("avancarEstagio: avanca para o proximo estagio por ordem")
    void avancarEstagioAvancaParaProximaOrdem() {
        var estagioAtual = estagio(2L, "Contato inicial", 2);
        var proximo = estagio(3L, "Qualificacao", 3);
        var ultimoEstagio = estagio(7L, "Matriculado", 7);
        var processo = new ProcessoMatricula();
        processo.setId(10L);
        processo.setEstagioAtual(estagioAtual);
        processo.setStatus(StatusProcessoMatricula.ATIVO);

        when(repository.findById(10L)).thenReturn(Optional.of(processo));
        when(funilEstagioRepository.findByOrdem(3)).thenReturn(Optional.of(proximo));
        when(funilEstagioRepository.findById(3L)).thenReturn(Optional.of(proximo));
        when(historicoEstagioRepository.findByProcessoIdAndDataSaidaIsNull(10L)).thenReturn(Optional.empty());
        when(funilEstagioRepository.findTopByOrderByOrdemDesc()).thenReturn(Optional.of(ultimoEstagio));

        service.avancarEstagio(10L, 99L);

        assertThat(processo.getEstagioAtual()).isSameAs(proximo);

        var captor = ArgumentCaptor.forClass(Interacao.class);
        verify(interacaoRepository).save(captor.capture());
        assertThat(captor.getValue().getTipo()).isEqualTo(TipoInteracao.SISTEMA);
        assertThat(captor.getValue().getResultado()).isEqualTo("Qualificacao");
    }

    @Test
    @DisplayName("avancarEstagio: ja no ultimo estagio, lanca OperacaoInvalidaException")
    void avancarEstagioNoUltimoEstagio() {
        var ultimoEstagio = estagio(7L, "Matriculado", 7);
        var processo = new ProcessoMatricula();
        processo.setId(10L);
        processo.setEstagioAtual(ultimoEstagio);

        when(repository.findById(10L)).thenReturn(Optional.of(processo));
        when(funilEstagioRepository.findByOrdem(8)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.avancarEstagio(10L, null))
                .isInstanceOf(OperacaoInvalidaException.class);

        verify(historicoEstagioRepository, never()).save(any());
        verify(interacaoRepository, never()).save(any());
    }

    // ------------------------------------------------------- perder / desistir / reatribuir

    @Test
    @DisplayName("marcarPerdido: seta status, motivo e data de conclusao")
    void marcarPerdido() {
        var processo = new ProcessoMatricula();
        processo.setId(10L);
        processo.setStatus(StatusProcessoMatricula.ATIVO);
        when(repository.findById(10L)).thenReturn(Optional.of(processo));

        service.marcarPerdido(10L, "Valor da mensalidade");

        assertThat(processo.getStatus()).isEqualTo(StatusProcessoMatricula.PERDIDO);
        assertThat(processo.getMotivoPerda()).isEqualTo("Valor da mensalidade");
        assertThat(processo.getDataConclusao()).isNotNull();
    }

    @Test
    @DisplayName("reatribuir: troca o funcionario responsavel pelo processo")
    void reatribuir() {
        var processo = new ProcessoMatricula();
        processo.setId(10L);
        var novoFuncionario = dadosPessoais(7L, "Rafael Pinto");
        when(repository.findById(10L)).thenReturn(Optional.of(processo));
        when(em.getReference(DadosPessoais.class, 7L)).thenReturn(novoFuncionario);

        service.reatribuir(10L, 7L);

        assertThat(processo.getFuncionario()).isSameAs(novoFuncionario);
    }

    // ------------------------------------------------------------------ distribuirFila

    @Test
    @DisplayName("distribuirFila: sem atendentes cadastrados, lanca OperacaoInvalidaException")
    void distribuirFilaSemAtendentes() {
        when(secretarioRepository.findAll()).thenReturn(List.of());

        assertThatThrownBy(() -> service.distribuirFila()).isInstanceOf(OperacaoInvalidaException.class);
    }

    @Test
    @DisplayName("distribuirFila: sem pendentes, retorna lista vazia sem tocar no repositorio")
    void distribuirFilaSemPendentes() {
        var ana = secretario(1L, "Ana");
        when(secretarioRepository.findAll()).thenReturn(List.of(ana));
        when(repository.findByStatusAndFuncionarioIsNullOrderByCriadoEmAsc(StatusProcessoMatricula.ATIVO))
                .thenReturn(List.of());

        var resultado = service.distribuirFila();

        assertThat(resultado).isEmpty();
        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("distribuirFila: distribui por menor carga corrente e desempata por ordem alfabetica")
    void distribuirFilaRoundRobinPorMenorCarga() {
        var ana = secretario(1L, "Ana");
        var beto = secretario(2L, "Beto");
        when(secretarioRepository.findAll()).thenReturn(List.of(ana, beto));
        when(repository.countByStatusAndFuncionarioId(StatusProcessoMatricula.ATIVO, 1L)).thenReturn(3L);
        when(repository.countByStatusAndFuncionarioId(StatusProcessoMatricula.ATIVO, 2L)).thenReturn(1L);

        var p1 = new ProcessoMatricula();
        p1.setId(101L);
        var p2 = new ProcessoMatricula();
        p2.setId(102L);
        var p3 = new ProcessoMatricula();
        p3.setId(103L);
        when(repository.findByStatusAndFuncionarioIsNullOrderByCriadoEmAsc(StatusProcessoMatricula.ATIVO))
                .thenReturn(List.of(p1, p2, p3));

        var resultado = service.distribuirFila();

        // Beto comeca com carga menor (1 < 3): recebe p1 e p2, empatando com Ana em 3.
        // No empate, p3 vai para Ana (ordem alfabetica).
        assertThat(resultado.get(0).getFuncionario().getNome()).isEqualTo("Beto");
        assertThat(resultado.get(1).getFuncionario().getNome()).isEqualTo("Beto");
        assertThat(resultado.get(2).getFuncionario().getNome()).isEqualTo("Ana");
    }

    @Test
    @DisplayName("distribuirFila: com cargas iguais, escolhe o atendente por ordem alfabetica")
    void distribuirFilaEmpateAlfabetico() {
        var beto = secretario(2L, "Beto");
        var ana = secretario(1L, "Ana");
        when(secretarioRepository.findAll()).thenReturn(List.of(beto, ana));
        when(repository.countByStatusAndFuncionarioId(eq(StatusProcessoMatricula.ATIVO), anyLong())).thenReturn(0L);

        var p1 = new ProcessoMatricula();
        p1.setId(201L);
        when(repository.findByStatusAndFuncionarioIsNullOrderByCriadoEmAsc(StatusProcessoMatricula.ATIVO))
                .thenReturn(List.of(p1));

        var resultado = service.distribuirFila();

        assertThat(resultado.get(0).getFuncionario().getNome()).isEqualTo("Ana");
    }

    // --------------------------------------------------------------------- relatorios

    @Test
    @DisplayName("relatorios: agrega conversao, tempos medios, origem e motivos de perda")
    void relatoriosAgregaCorretamente() {
        var origemInstagram = new OrigemLead();
        origemInstagram.setNome("Instagram");

        var agora = Instant.now();

        var p1 = new ProcessoMatricula();
        p1.setId(1L);
        p1.setAnoLetivo(2027);
        p1.setStatus(StatusProcessoMatricula.MATRICULADO);
        p1.setOrigem(origemInstagram);
        p1.setCriadoEm(agora.minus(10, ChronoUnit.DAYS));
        p1.setDataConclusao(agora);

        var p2 = new ProcessoMatricula();
        p2.setId(2L);
        p2.setAnoLetivo(2027);
        p2.setStatus(StatusProcessoMatricula.PERDIDO);
        p2.setOrigem(origemInstagram);
        p2.setMotivoPerda("Valor da mensalidade");
        p2.setCriadoEm(agora.minus(5, ChronoUnit.DAYS));

        var p3ForaDoAno = new ProcessoMatricula();
        p3ForaDoAno.setId(3L);
        p3ForaDoAno.setAnoLetivo(2026);
        p3ForaDoAno.setStatus(StatusProcessoMatricula.MATRICULADO);
        p3ForaDoAno.setOrigem(origemInstagram);

        when(repository.findAll()).thenReturn(List.of(p1, p2, p3ForaDoAno));
        when(funilEstagioRepository.findAllByOrderByOrdemAsc()).thenReturn(List.of());

        var interacaoHumana = new Interacao();
        interacaoHumana.setTipo(TipoInteracao.LIGACAO);
        interacaoHumana.setCriadoEm(agora.minus(8, ChronoUnit.DAYS));
        interacaoHumana.setProcesso(p1);
        when(interacaoRepository.findByProcessoIdOrderByCriadoEmDesc(1L)).thenReturn(List.of(interacaoHumana));
        when(interacaoRepository.findByProcessoIdOrderByCriadoEmDesc(2L)).thenReturn(List.of());

        var relatorio = service.relatorios(2027);

        assertThat(relatorio.totalLeads()).isEqualTo(2);
        assertThat(relatorio.totalMatriculados()).isEqualTo(1);
        assertThat(relatorio.totalPerdidos()).isEqualTo(1);
        assertThat(relatorio.conversaoPercentual()).isEqualTo(50.0);
        assertThat(relatorio.tempoMedioAteMatriculaDias()).isEqualTo(10.0);
        assertThat(relatorio.tempoMedioAte1ContatoDias()).isEqualTo(2.0);

        assertThat(relatorio.origens()).hasSize(1);
        assertThat(relatorio.origens().get(0).origemNome()).isEqualTo("Instagram");
        assertThat(relatorio.origens().get(0).quantidade()).isEqualTo(2);
        assertThat(relatorio.origens().get(0).conversaoPercentual()).isEqualTo(50.0);

        assertThat(relatorio.motivosPerda()).hasSize(1);
        assertThat(relatorio.motivosPerda().get(0).motivo()).isEqualTo("Valor da mensalidade");
        assertThat(relatorio.motivosPerda().get(0).percentual()).isEqualTo(100.0);
    }
}
