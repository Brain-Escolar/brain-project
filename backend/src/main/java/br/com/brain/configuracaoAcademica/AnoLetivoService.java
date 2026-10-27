package br.com.brain.configuracaoAcademica;

import br.com.brain.configuracaoAcademica.dto.AnoLetivoDto;
import br.com.brain.configuracaoAcademica.dto.PeriodosLetivosRequest;
import br.com.brain.enums.StatusAnoLetivo;
import br.com.brain.exception.ErrosSistema;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.Month;
import java.util.ArrayList;
import java.util.List;

/**
 * Ciclo de vida do ano letivo e dos seus períodos.
 *
 * É a única fonte do "ano corrente": nenhum serviço deveria mais usar o ano do
 * calendário. Em janeiro o ano corrente ainda pode ser o anterior (notas sendo
 * fechadas), e em dezembro a escola já monta o ano seguinte em PLANEJAMENTO.
 */
@Service
@RequiredArgsConstructor
public class AnoLetivoService {

    private final AnoLetivoRepository anoLetivoRepository;
    private final PeriodoLetivoRepository periodoLetivoRepository;
    private final ApplicationEventPublisher eventos;

    // ------------------------------------------------------------------ consulta

    /**
     * O ano ABERTO. Sem nenhum aberto (escola recém-criada, ou entre o
     * encerramento de um ano e a abertura do próximo), cai no ano do calendário
     * para as telas continuarem respondendo.
     */
    @Transactional(readOnly = true)
    public int anoCorrente() {
        return anoLetivoRepository.findFirstByStatus(StatusAnoLetivo.ABERTO)
                .map(AnoLetivo::getAno)
                .orElseGet(() -> LocalDate.now().getYear());
    }

    @Transactional(readOnly = true)
    public List<AnoLetivoDto> listar() {
        return anoLetivoRepository.findAllByOrderByAnoDesc().stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public AnoLetivoDto detalhar(int ano) {
        return toDto(buscar(ano));
    }

    @Transactional(readOnly = true)
    public AnoLetivoDto detalharCorrente() {
        return anoLetivoRepository.findById(anoCorrente())
                .map(this::toDto)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Ano letivo corrente"));
    }

    /**
     * Recusa escrita em ano encerrado. Para quem grava algo que pertence a um
     * ano (turma, matrícula, nota): ano encerrado é histórico.
     */
    @Transactional(readOnly = true)
    public void exigirEditavel(int ano) {
        anoLetivoRepository.findById(ano)
                .filter(AnoLetivo::isEncerrado)
                .ifPresent(a -> {
                    throw ErrosSistema.OperacaoInvalidaException.com(
                            "O ano letivo " + ano + " está encerrado e não aceita alterações.");
                });
    }

    // ------------------------------------------------------------------- escrita

    /**
     * Devolve o ano, criando-o em PLANEJAMENTO quando falta. É o caminho de quem
     * grava turma ou matrícula: a secretaria vende o ano seguinte antes de a
     * direção configurá-lo, e isso não pode travar o CRM. Ano encerrado é
     * recusado.
     */
    @Transactional
    public AnoLetivo garantir(int ano) {
        var existente = anoLetivoRepository.findById(ano);
        if (existente.isPresent()) {
            exigirEditavel(ano);
            return existente.get();
        }
        return criarComPeriodos(ano);
    }

    @Transactional
    public AnoLetivoDto criar(int ano) {
        if (anoLetivoRepository.existsById(ano)) {
            throw ErrosSistema.OperacaoInvalidaException.com("O ano letivo " + ano + " já existe.");
        }
        return toDto(criarComPeriodos(ano));
    }

    /**
     * Torna o ano o corrente. Só um ano fica aberto por vez: o anterior precisa
     * ser encerrado antes.
     */
    @Transactional
    public AnoLetivoDto abrir(int ano) {
        var anoLetivo = buscar(ano);
        if (anoLetivo.getStatus() != StatusAnoLetivo.PLANEJAMENTO) {
            throw ErrosSistema.OperacaoInvalidaException.com(
                    "Só um ano em planejamento pode ser aberto; " + ano + " está " + anoLetivo.getStatus() + ".");
        }
        anoLetivoRepository.findFirstByStatus(StatusAnoLetivo.ABERTO).ifPresent(aberto -> {
            throw ErrosSistema.OperacaoInvalidaException.com(
                    "O ano letivo " + aberto.getAno() + " ainda está aberto. Encerre-o antes de abrir " + ano + ".");
        });
        anoLetivo.setStatus(StatusAnoLetivo.ABERTO);
        anoLetivo.setAbertoEm(Instant.now());
        anoLetivoRepository.save(anoLetivo);
        eventos.publishEvent(new AnoLetivoAberto(ano));
        return toDto(anoLetivo);
    }

    /**
     * Fecha o que restar de período aberto e marca o ano como ENCERRADO. Quem
     * chama (ViradaAnoService) congela os resultados antes, na mesma transação.
     */
    @Transactional
    public void registrarEncerramento(int ano) {
        var anoLetivo = exigirAberto(ano);
        var agora = Instant.now();
        periodoLetivoRepository.findByAnoLetivoOrderBySequenciaAsc(ano).stream()
                .filter(p -> !p.isFechado())
                .forEach(p -> {
                    p.setFechadoEm(agora);
                    periodoLetivoRepository.save(p);
                });
        anoLetivo.setStatus(StatusAnoLetivo.ENCERRADO);
        anoLetivo.setEncerradoEm(agora);
        anoLetivoRepository.save(anoLetivo);
    }

    /** Só o ano corrente (ABERTO) pode ser encerrado. */
    @Transactional(readOnly = true)
    public AnoLetivo exigirAberto(int ano) {
        var anoLetivo = buscar(ano);
        if (anoLetivo.getStatus() != StatusAnoLetivo.ABERTO) {
            throw ErrosSistema.OperacaoInvalidaException.com(
                    "Só o ano corrente pode ser encerrado; " + ano + " está " + anoLetivo.getStatus() + ".");
        }
        return anoLetivo;
    }

    @Transactional(readOnly = true)
    public AnoLetivo exigirEncerrado(int ano) {
        var anoLetivo = buscar(ano);
        if (!anoLetivo.isEncerrado()) {
            throw ErrosSistema.OperacaoInvalidaException.com(
                    "Encerre " + ano + " antes: a rematrícula usa o resultado final do ano.");
        }
        return anoLetivo;
    }

    /**
     * Grava o calendário inteiro do ano. A posição na lista é a sequência;
     * períodos já gravados são atualizados no lugar (o id não muda, então o que
     * aponta para eles continua valendo) e os que sobram são removidos. O ano
     * passa a ir do início do primeiro período ao fim do último.
     */
    @Transactional
    public AnoLetivoDto salvarPeriodos(int ano, PeriodosLetivosRequest pedido) {
        var anoLetivo = buscar(ano);
        exigirEditavel(ano);
        validarCalendario(ano, pedido.periodos());

        var atuais = periodoLetivoRepository.findByAnoLetivoOrderBySequenciaAsc(ano);
        var novos = pedido.periodos();
        exigirFechadosIntactos(atuais, novos);

        // Remove primeiro: a UNIQUE (ano_letivo, sequencia) não pode ver duas
        // linhas com a mesma sequência no meio da troca.
        var sobrando = atuais.stream().filter(p -> p.getSequencia() > novos.size()).toList();
        periodoLetivoRepository.deleteAll(sobrando);
        periodoLetivoRepository.flush();

        for (int i = 0; i < novos.size(); i++) {
            int sequencia = i + 1;
            var dados = novos.get(i);
            var periodo = atuais.stream()
                    .filter(p -> p.getSequencia() == sequencia)
                    .findFirst()
                    .orElseGet(PeriodoLetivo::new);
            periodo.setAnoLetivo(ano);
            periodo.setSequencia(sequencia);
            periodo.setNome(dados.nome().trim());
            periodo.setDataInicio(dados.dataInicio());
            periodo.setDataFim(dados.dataFim());
            periodoLetivoRepository.save(periodo);
        }

        anoLetivo.setDataInicio(novos.get(0).dataInicio());
        anoLetivo.setDataFim(novos.get(novos.size() - 1).dataFim());
        anoLetivoRepository.save(anoLetivo);

        return toDto(anoLetivo);
    }

    /**
     * Período fechado é definitivo: mudar as datas dele mudaria o bimestre de
     * notas e chamadas já fechadas. Para alterar, reabra antes.
     */
    static void exigirFechadosIntactos(List<PeriodoLetivo> atuais, List<PeriodosLetivosRequest.Periodo> novos) {
        for (var atual : atuais) {
            if (!atual.isFechado()) {
                continue;
            }
            int indice = atual.getSequencia() - 1;
            var novo = indice < novos.size() ? novos.get(indice) : null;
            boolean intacto = novo != null
                    && atual.getDataInicio().equals(novo.dataInicio())
                    && atual.getDataFim().equals(novo.dataFim());
            if (!intacto) {
                throw ErrosSistema.OperacaoInvalidaException.com(
                        atual.getNome() + " está fechado: reabra o período antes de mudar ou remover as datas dele.");
            }
        }
    }

    // ---------------------------------------------------------------- fechamento

    /** Fecha o período: notas e chamadas dele passam a ser definitivas. */
    @Transactional
    public AnoLetivoDto fecharPeriodo(int ano, int sequencia) {
        var anoLetivo = buscar(ano);
        exigirEditavel(ano);
        var periodo = buscarPeriodo(ano, sequencia);
        if (periodo.isFechado()) {
            throw ErrosSistema.OperacaoInvalidaException.com(periodo.getNome() + " já está fechado.");
        }
        periodo.setFechadoEm(Instant.now());
        periodoLetivoRepository.save(periodo);
        return toDto(anoLetivo);
    }

    /** Reabre o período para correção. Ano encerrado não reabre período. */
    @Transactional
    public AnoLetivoDto reabrirPeriodo(int ano, int sequencia) {
        var anoLetivo = buscar(ano);
        exigirEditavel(ano);
        var periodo = buscarPeriodo(ano, sequencia);
        periodo.setFechadoEm(null);
        periodoLetivoRepository.save(periodo);
        return toDto(anoLetivo);
    }

    /**
     * O período de uma avaliação sem período informado: o que contém a data;
     * fora de qualquer período (férias), o último que já começou; antes de o ano
     * começar, o primeiro. Nulo só se o ano não tem período nenhum.
     */
    @Transactional(readOnly = true)
    public PeriodoLetivo periodoPara(int ano, LocalDate data) {
        var periodos = periodoLetivoRepository.findByAnoLetivoOrderBySequenciaAsc(ano);
        if (periodos.isEmpty()) {
            return null;
        }
        var referencia = data != null ? data : LocalDate.now();
        PeriodoLetivo ultimoIniciado = null;
        for (var periodo : periodos) {
            if (periodo.contem(referencia)) {
                return periodo;
            }
            if (!periodo.getDataInicio().isAfter(referencia)) {
                ultimoIniciado = periodo;
            }
        }
        return ultimoIniciado != null ? ultimoIniciado : periodos.get(0);
    }

    /** Recusa lançar ou alterar algo que conta para um período fechado ou de ano encerrado. */
    public void exigirPeriodoAberto(PeriodoLetivo periodo) {
        if (periodo == null) {
            return;
        }
        exigirEditavel(periodo.getAnoLetivo());
        if (periodo.isFechado()) {
            throw ErrosSistema.OperacaoInvalidaException.com(
                    periodo.getNome() + " de " + periodo.getAnoLetivo()
                            + " está fechado. Peça à direção para reabrir o período antes de alterar.");
        }
    }

    /**
     * Para o que é registrado por data (chamada): ano encerrado ou data dentro
     * de período fechado não aceitam alteração.
     */
    @Transactional(readOnly = true)
    public void exigirDataAberta(int ano, LocalDate data) {
        exigirEditavel(ano);
        periodoLetivoRepository.findByAnoLetivoOrderBySequenciaAsc(ano).stream()
                .filter(p -> p.contem(data))
                .findFirst()
                .ifPresent(this::exigirPeriodoAberto);
    }

    /**
     * Períodos em ordem, sem sobreposição e dentro do próprio ano civil (ou
     * terminando até janeiro do seguinte, que é onde recuperação final cai).
     */
    static void validarCalendario(int ano, List<PeriodosLetivosRequest.Periodo> periodos) {
        LocalDate fimAnterior = null;
        for (int i = 0; i < periodos.size(); i++) {
            var periodo = periodos.get(i);
            var rotulo = (i + 1) + "º período";
            if (periodo.dataFim().isBefore(periodo.dataInicio())) {
                throw ErrosSistema.OperacaoInvalidaException.com(rotulo + ": a data de fim é anterior à de início.");
            }
            if (fimAnterior != null && !periodo.dataInicio().isAfter(fimAnterior)) {
                throw ErrosSistema.OperacaoInvalidaException.com(
                        rotulo + ": começa antes do fim do período anterior.");
            }
            if (periodo.dataInicio().getYear() != ano) {
                throw ErrosSistema.OperacaoInvalidaException.com(rotulo + ": precisa começar em " + ano + ".");
            }
            if (periodo.dataFim().isAfter(LocalDate.of(ano + 1, Month.JANUARY, 31))) {
                throw ErrosSistema.OperacaoInvalidaException.com(
                        rotulo + ": termina depois de janeiro de " + (ano + 1) + ".");
            }
            fimAnterior = periodo.dataFim();
        }
    }

    // ------------------------------------------------------------------ internos

    private AnoLetivo criarComPeriodos(int ano) {
        var periodos = periodosIniciais(ano);

        var anoLetivo = new AnoLetivo();
        anoLetivo.setAno(ano);
        anoLetivo.setStatus(StatusAnoLetivo.PLANEJAMENTO);
        anoLetivo.setDataInicio(periodos.get(0).getDataInicio());
        anoLetivo.setDataFim(periodos.get(periodos.size() - 1).getDataFim());
        anoLetivoRepository.saveAndFlush(anoLetivo);

        periodoLetivoRepository.saveAll(periodos);
        return anoLetivo;
    }

    /**
     * Copia o calendário do ano anterior um ano à frente — escola costuma repetir
     * a divisão — e, sem ano anterior, usa 4 bimestres.
     */
    private List<PeriodoLetivo> periodosIniciais(int ano) {
        var anteriores = periodoLetivoRepository.findByAnoLetivoOrderBySequenciaAsc(ano - 1);
        List<PeriodoLetivo> periodos = new ArrayList<>();
        if (!anteriores.isEmpty()) {
            for (var anterior : anteriores) {
                periodos.add(periodo(ano, anterior.getNome(), anterior.getSequencia(),
                        anterior.getDataInicio().plusYears(1), anterior.getDataFim().plusYears(1)));
            }
            return periodos;
        }
        periodos.add(periodo(ano, "1º Bimestre", 1, LocalDate.of(ano, Month.FEBRUARY, 1), LocalDate.of(ano, Month.APRIL, 30)));
        periodos.add(periodo(ano, "2º Bimestre", 2, LocalDate.of(ano, Month.MAY, 1), LocalDate.of(ano, Month.JULY, 15)));
        periodos.add(periodo(ano, "3º Bimestre", 3, LocalDate.of(ano, Month.JULY, 16), LocalDate.of(ano, Month.SEPTEMBER, 30)));
        periodos.add(periodo(ano, "4º Bimestre", 4, LocalDate.of(ano, Month.OCTOBER, 1), LocalDate.of(ano, Month.DECEMBER, 20)));
        return periodos;
    }

    private static PeriodoLetivo periodo(int ano, String nome, int sequencia, LocalDate inicio, LocalDate fim) {
        var periodo = new PeriodoLetivo();
        periodo.setAnoLetivo(ano);
        periodo.setNome(nome);
        periodo.setSequencia(sequencia);
        periodo.setDataInicio(inicio);
        periodo.setDataFim(fim);
        return periodo;
    }

    private PeriodoLetivo buscarPeriodo(int ano, int sequencia) {
        return periodoLetivoRepository.findByAnoLetivoOrderBySequenciaAsc(ano).stream()
                .filter(p -> p.getSequencia() == sequencia)
                .findFirst()
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para(
                        "Período " + sequencia + " de " + ano));
    }

    private AnoLetivo buscar(int ano) {
        return anoLetivoRepository.findById(ano)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Ano letivo", ano));
    }

    private AnoLetivoDto toDto(AnoLetivo ano) {
        return AnoLetivoDto.de(ano, periodoLetivoRepository.findByAnoLetivoOrderBySequenciaAsc(ano.getAno()));
    }
}
