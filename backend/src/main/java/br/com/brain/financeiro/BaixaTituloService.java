package br.com.brain.financeiro;

import br.com.brain.contrato.Titulo;
import br.com.brain.contrato.TituloRepository;
import br.com.brain.contrato.dto.TituloDto;
import br.com.brain.dadosPessoais.DadosPessoaisRepository;
import br.com.brain.enums.StatusTitulo;
import br.com.brain.exception.ErrosSistema.OperacaoInvalidaException;
import br.com.brain.exception.ErrosSistema.RecursoNaoEncontradoException;
import br.com.brain.financeiro.dto.BaixaDto;
import br.com.brain.financeiro.dto.BaixaRequest;
import br.com.brain.financeiro.dto.EstornoRequest;
import br.com.brain.financeiro.dto.PagamentoDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Baixa manual e estorno.
 *
 * Na V1 a baixa e sempre humana: o pai paga no caixa, por Pix ou com boleto, e a
 * secretaria lanca. Na V2, quando entrar o gateway, a baixa passa a vir por
 * webhook -- e vai chamar estes mesmos metodos, com outro operador. Por isso o
 * operador e parametro e nao vem do SecurityContext aqui dentro: um job nao tem
 * SecurityContext, e quando essa hora chegar nao se muda nada.
 *
 * Duas regras valem a pena explicar, porque as duas foram escolhas e nao
 * acidentes:
 *
 * 1. BAIXA PARCIAL NAO EXISTE. Receber menos que a parcela e recusado. Aceitar
 *    deixaria um saldo invisivel -- o titulo iria para PAGO com valor menor e
 *    nenhum relatorio cobraria a diferenca. Quem recebeu menos renegocia, que e
 *    operacao com nome, vencimento e rastro.
 *
 * 2. TITULO ESTORNADO NAO VOLTA PARA ABERTO. Ele morre em ESTORNADO e, por
 *    padrao, nasce outro no lugar. Voltar para ABERTO apagaria o fato de que
 *    houve uma entrada no caixa -- e o extrato do banco continuaria mostrando.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BaixaTituloService {

    private static final int ESCALA = 2;

    private final TituloRepository tituloRepository;
    private final PagamentoRepository pagamentoRepository;
    private final DadosPessoaisRepository dadosPessoaisRepository;

    /**
     * Registra que a parcela entrou.
     *
     * @param operadorId dadosPessoais de quem esta dando a baixa
     */
    @Transactional
    public BaixaDto baixar(Long tituloId, BaixaRequest pedido, Long operadorId) {
        exigirOperador(operadorId);

        // Trava a linha ANTES de olhar o status. Duas secretarias clicando na
        // mesma parcela: a segunda espera aqui, le o status ja PAGO e para no
        // teste abaixo. Sem a trava, as duas leem ABERTO e gravam duas baixas.
        var titulo = tituloRepository.travarParaBaixa(tituloId)
                .orElseThrow(() -> RecursoNaoEncontradoException.para("Título", tituloId));

        if (!titulo.estaAberto()) {
            throw OperacaoInvalidaException.com(
                    "A parcela " + titulo.getNumeroParcela() + " está " + titulo.getStatus()
                            + " e não aceita baixa. Se a baixa anterior foi errada, estorne-a.");
        }

        var dataPagamento = resolverData(pedido.dataPagamento());
        var valorPago = resolverValor(pedido.valorPago(), titulo);

        var pagamento = pagamentoRepository.save(Pagamento.registrar(
                titulo, valorPago, dataPagamento, pedido.forma(), operadorId, pedido.observacao()));

        titulo.pagar();
        tituloRepository.save(titulo);

        log.info("BAIXA: titulo id={} parcela={} valor={} forma={} por dadosPessoaisId={}",
                titulo.getId(), titulo.getNumeroParcela(), valorPago, pedido.forma(), operadorId);

        return BaixaDto.de(montarDto(pagamento), new TituloDto(titulo));
    }

    /**
     * Desfaz a baixa e, por padrao, reemite a parcela.
     */
    @Transactional
    public BaixaDto estornar(Long pagamentoId, EstornoRequest pedido, Long operadorId) {
        exigirOperador(operadorId);

        var pagamento = pagamentoRepository.findById(pagamentoId)
                .orElseThrow(() -> RecursoNaoEncontradoException.para("Pagamento", pagamentoId));

        if (!pagamento.estaVivo()) {
            throw OperacaoInvalidaException.com(
                    "Este pagamento já foi estornado em " + pagamento.getEstornadoEm() + ".");
        }

        // Mesma trava da baixa, e pelo mesmo motivo: impedir que uma baixa
        // concorrente atravesse o estorno no meio.
        var tituloId = pagamento.getTitulo().getId();
        var titulo = tituloRepository.travarParaBaixa(tituloId)
                .orElseThrow(() -> RecursoNaoEncontradoException.para("Título", tituloId));

        if (titulo.getStatus() != StatusTitulo.PAGO) {
            throw OperacaoInvalidaException.com(
                    "A parcela " + titulo.getNumeroParcela() + " está " + titulo.getStatus()
                            + ", não PAGO, e por isso não há baixa a estornar.");
        }

        pagamento.estornar(operadorId, pedido.motivo());
        pagamentoRepository.save(pagamento);

        titulo.estornar();
        tituloRepository.save(titulo);

        TituloDto reemitidoDto = null;
        if (pedido.deveReemitir()) {
            var reemitido = tituloRepository.save(Titulo.substituindo(
                    titulo,
                    resolverVencimentoDaReemissao(titulo, pedido.novoVencimento()),
                    titulo.getValorBruto(),
                    titulo.getValorDesconto(),
                    titulo.getDescricao()));
            reemitidoDto = new TituloDto(reemitido);
            log.info("ESTORNO com reemissão: titulo estornado id={} -> novo id={} versao={} venc={}",
                    titulo.getId(), reemitido.getId(), reemitido.getVersao(), reemitido.getVencimento());
        } else {
            log.warn("ESTORNO SEM reemissão: titulo id={} parcela={} sai do contas a receber. Motivo: {}",
                    titulo.getId(), titulo.getNumeroParcela(), pedido.motivo());
        }

        return new BaixaDto(montarDto(pagamento), new TituloDto(titulo), reemitidoDto);
    }

    @Transactional(readOnly = true)
    public List<PagamentoDto> doTitulo(Long tituloId) {
        return montarLista(pagamentoRepository.findByTituloIdOrderByIdDesc(tituloId));
    }

    /** Conferencia de caixa: o que entrou numa data, estornos de fora. */
    @Transactional(readOnly = true)
    public List<PagamentoDto> caixaDoDia(LocalDate data) {
        return montarLista(pagamentoRepository.buscarDoDia(data == null ? LocalDate.now() : data));
    }

    // ------------------------------------------------------------------ regras

    private LocalDate resolverData(LocalDate informada) {
        var data = informada == null ? LocalDate.now() : informada;
        if (data.isAfter(LocalDate.now())) {
            throw OperacaoInvalidaException.com(
                    "A data do pagamento não pode estar no futuro (" + data + "). Dinheiro que ainda"
                            + " não entrou não se dá baixa.");
        }
        return data;
    }

    private BigDecimal resolverValor(BigDecimal informado, Titulo titulo) {
        if (informado == null) {
            return titulo.getValorLiquido();
        }
        if (informado.signum() <= 0) {
            throw OperacaoInvalidaException.com("O valor pago tem de ser positivo.");
        }
        // Mesma razao de RateioFinanceiro: a coluna e DECIMAL(10,2) e o banco
        // arredondaria calado, deixando o caixa diferente do que foi digitado.
        if (informado.stripTrailingZeros().scale() > ESCALA) {
            throw OperacaoInvalidaException.com(
                    "O valor pago tem mais de duas casas decimais (" + informado.toPlainString()
                            + ").");
        }
        if (informado.compareTo(titulo.getValorLiquido()) < 0) {
            throw OperacaoInvalidaException.com(
                    "Baixa parcial não é possível: a parcela é de " + titulo.getValorLiquido()
                            + " e o valor informado é " + informado.toPlainString()
                            + ". Para receber menos, renegocie a parcela.");
        }
        return informado;
    }

    /**
     * Vencimento da parcela reemitida.
     *
     * Mantem o original quando ele ainda nao passou; se passou, usa hoje. Reemitir
     * com vencimento no passado faria a parcela nascer em atraso e entrar no aging
     * no mesmo instante -- a familia receberia cobranca de algo que acabou de ser
     * emitido.
     */
    private LocalDate resolverVencimentoDaReemissao(Titulo titulo, LocalDate informado) {
        if (informado != null) {
            return informado;
        }
        var hoje = LocalDate.now();
        return titulo.getVencimento().isBefore(hoje) ? hoje : titulo.getVencimento();
    }

    private void exigirOperador(Long operadorId) {
        if (operadorId == null) {
            throw OperacaoInvalidaException.com(
                    "Não foi possível identificar quem está dando a baixa. Faça login novamente.");
        }
    }

    private PagamentoDto montarDto(Pagamento pagamento) {
        return PagamentoDto.de(pagamento, nomeDe(pagamento.getRegistradoPorId()));
    }

    /**
     * Resolve os nomes dos operadores de uma vez.
     *
     * Em lista isto importa: o caixa de um dia movimentado tem dezenas de baixas,
     * quase sempre das mesmas duas ou tres pessoas da secretaria. Nome por nome
     * seriam dezenas de consultas para buscar tres nomes.
     */
    private List<PagamentoDto> montarLista(List<Pagamento> pagamentos) {
        if (pagamentos.isEmpty()) {
            return List.of();
        }
        var ids = pagamentos.stream()
                .map(Pagamento::getRegistradoPorId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();
        var nomes = dadosPessoaisRepository.findAllById(ids).stream()
                .filter(dp -> dp.getNome() != null)
                .collect(Collectors.toMap(dp -> dp.getId(), dp -> dp.getNome(), (a, b) -> a));

        return pagamentos.stream()
                .map(p -> PagamentoDto.de(p, nomes.get(p.getRegistradoPorId())))
                .toList();
    }

    private String nomeDe(Long dadosPessoaisId) {
        if (dadosPessoaisId == null) {
            return null;
        }
        return dadosPessoaisRepository.findById(dadosPessoaisId)
                .map(dp -> dp.getNome())
                .orElse(null);
    }
}
