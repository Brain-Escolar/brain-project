package br.com.brain.financeiro;

import br.com.brain.contrato.ContratoServico;
import br.com.brain.contrato.Titulo;
import br.com.brain.contrato.TituloRepository;
import br.com.brain.dadosPessoais.DadosPessoaisRepository;
import br.com.brain.enums.FormaPagamento;
import br.com.brain.enums.StatusTitulo;
import br.com.brain.exception.ErrosSistema;
import br.com.brain.financeiro.dto.BaixaRequest;
import br.com.brain.financeiro.dto.EstornoRequest;
import br.com.brain.responsavel.Responsavel;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * As regras da baixa manual.
 *
 * Mock em tudo: nenhuma destas regras depende de SQL. A UNICA que depende de
 * banco -- a trava FOR UPDATE que impede duas baixas simultaneas -- nao da para
 * testar aqui, e esta provada onde se prova: o plano LockRows no PostgreSQL, como
 * foi feito para o envelope de bolsa.
 *
 * Datas RELATIVAS a hoje, nunca fixas. Um fixture com data fixa perto da borda
 * (a baixa recusa data futura) quebra sozinho quando o calendario anda.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("BaixaTituloService")
class BaixaTituloServiceTest {

    private static final Long OPERADOR = 99L;

    @Mock
    private TituloRepository tituloRepository;

    @Mock
    private PagamentoRepository pagamentoRepository;

    @Mock
    private DadosPessoaisRepository dadosPessoaisRepository;

    @InjectMocks
    private BaixaTituloService service;

    // ------------------------------------------------------------- fixtures

    /** Mensalidade de 1.350 com 20% de bolsa: 1.080 a pagar. */
    private Titulo tituloAberto(LocalDate vencimento) {
        var responsavel = new Responsavel();
        responsavel.setId(7L);

        var contrato = new ContratoServico();
        contrato.setId(3L);
        contrato.setNumero("CT-2027-1");
        contrato.setQtdParcelas(12);

        return Titulo.parcela(contrato, responsavel,
                vencimento.withDayOfMonth(1), 1, vencimento, "Parcela 1/12",
                new BigDecimal("1350.00"), new BigDecimal("270.00"));
    }

    private Titulo tituloPago(LocalDate vencimento) {
        var titulo = tituloAberto(vencimento);
        titulo.pagar();
        return titulo;
    }

    private void devolveOTituloTravado(Titulo titulo) {
        when(tituloRepository.travarParaBaixa(any())).thenReturn(Optional.of(titulo));
    }

    /** O servico usa o retorno do save do pagamento; o do titulo, nao. */
    private void ecoNosSaves() {
        when(pagamentoRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(dadosPessoaisRepository.findById(any())).thenReturn(Optional.empty());
    }

    @Nested
    @DisplayName("baixa")
    class Baixa {

        @Test
        @DisplayName("sem valor e sem data, usa o líquido da parcela e hoje")
        void padroes() {
            var titulo = tituloAberto(LocalDate.now());
            devolveOTituloTravado(titulo);
            ecoNosSaves();

            var resultado = service.baixar(1L,
                    new BaixaRequest(FormaPagamento.PIX, null, null, null), OPERADOR);

            assertThat(resultado.pagamento().valorPago()).isEqualByComparingTo("1080.00");
            assertThat(resultado.pagamento().dataPagamento()).isEqualTo(LocalDate.now());
            assertThat(resultado.pagamento().forma()).isEqualTo(FormaPagamento.PIX);
            assertThat(resultado.pagamento().registradoPorId()).isEqualTo(OPERADOR);
            assertThat(resultado.pagamento().estornado()).isFalse();
            assertThat(titulo.getStatus()).isEqualTo(StatusTitulo.PAGO);
            assertThat(resultado.titulo().status()).isEqualTo(StatusTitulo.PAGO);
            assertThat(resultado.tituloReemitido()).isNull();
        }

        /**
         * Boleto pago com juros. Aceitar mais que o liquido e de proposito: o
         * dinheiro entrou, e recusar deixaria a secretaria sem como registrar.
         */
        @Test
        @DisplayName("valor acima do líquido é aceito")
        void comJuros() {
            var titulo = tituloAberto(LocalDate.now().minusDays(20));
            devolveOTituloTravado(titulo);
            ecoNosSaves();

            var resultado = service.baixar(1L, new BaixaRequest(
                    FormaPagamento.BOLETO, null, new BigDecimal("1105.40"), "juros e multa"),
                    OPERADOR);

            assertThat(resultado.pagamento().valorPago()).isEqualByComparingTo("1105.40");
            assertThat(titulo.getStatus()).isEqualTo(StatusTitulo.PAGO);
        }

        /**
         * Esta e a regra que protege o contas a receber. Baixa de 1.000 numa
         * parcela de 1.080 levaria o titulo para PAGO e os 80 reais sumiriam: nao
         * apareceriam em relatorio nenhum, porque nenhum relatorio olha titulo
         * pago.
         */
        @Test
        @DisplayName("valor abaixo do líquido é recusado, apontando a renegociação")
        void baixaParcialRecusada() {
            devolveOTituloTravado(tituloAberto(LocalDate.now()));

            assertThatThrownBy(() -> service.baixar(1L, new BaixaRequest(
                    FormaPagamento.DINHEIRO, null, new BigDecimal("1000.00"), null), OPERADOR))
                    .isInstanceOf(ErrosSistema.OperacaoInvalidaException.class)
                    .hasMessageContaining("parcial")
                    .hasMessageContaining("renegocie");
        }

        @Test
        @DisplayName("data no futuro é recusada")
        void dataFutura() {
            devolveOTituloTravado(tituloAberto(LocalDate.now()));

            assertThatThrownBy(() -> service.baixar(1L, new BaixaRequest(
                    FormaPagamento.PIX, LocalDate.now().plusDays(1), null, null), OPERADOR))
                    .isInstanceOf(ErrosSistema.OperacaoInvalidaException.class)
                    .hasMessageContaining("futuro");
        }

        @Test
        @DisplayName("data no passado é aceita: o Pix caiu sábado e foi lançado segunda")
        void dataNoPassado() {
            var titulo = tituloAberto(LocalDate.now().minusDays(5));
            var sabado = LocalDate.now().minusDays(2);
            devolveOTituloTravado(titulo);
            ecoNosSaves();

            var resultado = service.baixar(1L,
                    new BaixaRequest(FormaPagamento.PIX, sabado, null, null), OPERADOR);

            assertThat(resultado.pagamento().dataPagamento()).isEqualTo(sabado);
        }

        @Test
        @DisplayName("valor com mais de duas casas é recusado")
        void casasDemais() {
            devolveOTituloTravado(tituloAberto(LocalDate.now()));

            assertThatThrownBy(() -> service.baixar(1L, new BaixaRequest(
                    FormaPagamento.PIX, null, new BigDecimal("1080.005"), null), OPERADOR))
                    .isInstanceOf(ErrosSistema.OperacaoInvalidaException.class)
                    .hasMessageContaining("duas casas");
        }

        @Test
        @DisplayName("título já pago não aceita outra baixa, e a mensagem diz o que fazer")
        void duplaBaixaRecusada() {
            devolveOTituloTravado(tituloPago(LocalDate.now()));

            assertThatThrownBy(() -> service.baixar(1L,
                    new BaixaRequest(FormaPagamento.PIX, null, null, null), OPERADOR))
                    .isInstanceOf(ErrosSistema.OperacaoInvalidaException.class)
                    .hasMessageContaining("PAGO")
                    .hasMessageContaining("estorne");
        }

        @Test
        @DisplayName("título inexistente dá 404, não 500")
        void tituloInexistente() {
            when(tituloRepository.travarParaBaixa(any())).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.baixar(404L,
                    new BaixaRequest(FormaPagamento.PIX, null, null, null), OPERADOR))
                    .isInstanceOf(ErrosSistema.RecursoNaoEncontradoException.class);
        }

        /**
         * Sem operador nao ha baixa. Pagamento sem autor e um registro que ninguem
         * consegue auditar -- e o banco recusaria depois, com erro feio.
         */
        @Test
        @DisplayName("sem operador identificado, nem chega a olhar o título")
        void semOperador() {
            assertThatThrownBy(() -> service.baixar(1L,
                    new BaixaRequest(FormaPagamento.PIX, null, null, null), null))
                    .isInstanceOf(ErrosSistema.OperacaoInvalidaException.class)
                    .hasMessageContaining("login");
        }
    }

    @Nested
    @DisplayName("estorno")
    class Estorno {

        private void ecoNosSavesDoEstorno() {
            when(pagamentoRepository.save(any())).thenAnswer(i -> i.getArgument(0));
            when(tituloRepository.save(any())).thenAnswer(i -> i.getArgument(0));
            when(dadosPessoaisRepository.findById(any())).thenReturn(Optional.empty());
        }

        private Pagamento pagamentoDe(Titulo titulo) {
            return Pagamento.registrar(titulo, titulo.getValorLiquido(), LocalDate.now(),
                    FormaPagamento.CHEQUE, OPERADOR, null);
        }

        @Test
        @DisplayName("por padrão reemite: a dívida não pode desaparecer")
        void reemitePorPadrao() {
            var titulo = tituloPago(LocalDate.now().plusDays(10));
            var pagamento = pagamentoDe(titulo);
            when(pagamentoRepository.findById(any())).thenReturn(Optional.of(pagamento));
            devolveOTituloTravado(titulo);
            ecoNosSavesDoEstorno();

            var resultado = service.estornar(1L,
                    new EstornoRequest("cheque devolvido pelo banco", null, null), OPERADOR);

            assertThat(pagamento.estaVivo()).isFalse();
            assertThat(pagamento.getMotivoEstorno()).isEqualTo("cheque devolvido pelo banco");
            assertThat(pagamento.getEstornadoPorId()).isEqualTo(OPERADOR);
            assertThat(titulo.getStatus()).isEqualTo(StatusTitulo.ESTORNADO);

            assertThat(resultado.tituloReemitido()).isNotNull();
            assertThat(resultado.tituloReemitido().versao()).isEqualTo(2);
            assertThat(resultado.tituloReemitido().status()).isEqualTo(StatusTitulo.ABERTO);
            assertThat(resultado.tituloReemitido().valorLiquido()).isEqualByComparingTo("1080.00");
            assertThat(resultado.tituloReemitido().valorDesconto())
                    .as("a bolsa tem de sobreviver à reemissão")
                    .isEqualByComparingTo("270.00");
        }

        /**
         * O vencimento original ainda nao passou: mantem. Antecipar castigaria a
         * familia por um erro que foi da escola.
         */
        @Test
        @DisplayName("reemissão mantém o vencimento original quando ele ainda não passou")
        void mantemVencimentoFuturo() {
            var vencimento = LocalDate.now().plusDays(10);
            var titulo = tituloPago(vencimento);
            when(pagamentoRepository.findById(any())).thenReturn(Optional.of(pagamentoDe(titulo)));
            devolveOTituloTravado(titulo);
            ecoNosSavesDoEstorno();

            var resultado = service.estornar(1L,
                    new EstornoRequest("baixa em duplicidade", null, null), OPERADOR);

            assertThat(resultado.tituloReemitido().vencimento()).isEqualTo(vencimento);
        }

        /**
         * Vencimento ja passado viraria parcela nascendo em atraso, entrando no
         * aging no mesmo instante e indo para a regua de cobranca -- a familia
         * receberia cobranca de algo emitido naquele minuto.
         */
        @Test
        @DisplayName("reemissão não nasce vencida: vencimento passado vira hoje")
        void naoNasceVencida() {
            var titulo = tituloPago(LocalDate.now().minusDays(40));
            when(pagamentoRepository.findById(any())).thenReturn(Optional.of(pagamentoDe(titulo)));
            devolveOTituloTravado(titulo);
            ecoNosSavesDoEstorno();

            var resultado = service.estornar(1L,
                    new EstornoRequest("cheque devolvido pelo banco", null, null), OPERADOR);

            assertThat(resultado.tituloReemitido().vencimento()).isEqualTo(LocalDate.now());
            assertThat(resultado.tituloReemitido().vencido()).isFalse();
        }

        @Test
        @DisplayName("vencimento informado manda")
        void vencimentoInformado() {
            var titulo = tituloPago(LocalDate.now().minusDays(40));
            var combinado = LocalDate.now().plusDays(7);
            when(pagamentoRepository.findById(any())).thenReturn(Optional.of(pagamentoDe(titulo)));
            devolveOTituloTravado(titulo);
            ecoNosSavesDoEstorno();

            var resultado = service.estornar(1L,
                    new EstornoRequest("renegociado no balcão", null, combinado), OPERADOR);

            assertThat(resultado.tituloReemitido().vencimento()).isEqualTo(combinado);
        }

        /** Baixa lancada no aluno errado: a parcela certa ja existe em outro contrato. */
        @Test
        @DisplayName("reemitir=false não cria parcela nova")
        void semReemissao() {
            var titulo = tituloPago(LocalDate.now());
            when(pagamentoRepository.findById(any())).thenReturn(Optional.of(pagamentoDe(titulo)));
            devolveOTituloTravado(titulo);
            when(pagamentoRepository.save(any())).thenAnswer(i -> i.getArgument(0));
            when(dadosPessoaisRepository.findById(any())).thenReturn(Optional.empty());

            var resultado = service.estornar(1L,
                    new EstornoRequest("baixa lançada no aluno errado", false, null), OPERADOR);

            assertThat(resultado.tituloReemitido()).isNull();
            assertThat(titulo.getStatus()).isEqualTo(StatusTitulo.ESTORNADO);
        }

        @Test
        @DisplayName("pagamento já estornado é recusado")
        void jaEstornado() {
            var titulo = tituloPago(LocalDate.now());
            var pagamento = pagamentoDe(titulo);
            pagamento.estornar(OPERADOR, "primeiro estorno");
            when(pagamentoRepository.findById(any())).thenReturn(Optional.of(pagamento));

            assertThatThrownBy(() -> service.estornar(1L,
                    new EstornoRequest("segundo estorno", null, null), OPERADOR))
                    .isInstanceOf(ErrosSistema.OperacaoInvalidaException.class)
                    .hasMessageContaining("já foi estornado");
        }

        @Test
        @DisplayName("título que não está PAGO não tem baixa a estornar")
        void tituloNaoPago() {
            var titulo = tituloAberto(LocalDate.now());
            when(pagamentoRepository.findById(any())).thenReturn(Optional.of(pagamentoDe(titulo)));
            devolveOTituloTravado(titulo);

            assertThatThrownBy(() -> service.estornar(1L,
                    new EstornoRequest("qualquer motivo aqui", null, null), OPERADOR))
                    .isInstanceOf(ErrosSistema.OperacaoInvalidaException.class)
                    .hasMessageContaining("ABERTO");
        }

        @Test
        @DisplayName("pagamento inexistente dá 404")
        void pagamentoInexistente() {
            when(pagamentoRepository.findById(any())).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.estornar(404L,
                    new EstornoRequest("motivo qualquer", null, null), OPERADOR))
                    .isInstanceOf(ErrosSistema.RecursoNaoEncontradoException.class);
        }
    }

    @Nested
    @DisplayName("reemissão direta da entidade")
    class Reemissao {

        /**
         * A trava que impede cobrar duas vezes a mesma parcela. O indice unico do
         * banco nao pega: as duas linhas teriam versoes diferentes, e para o banco
         * sao parcelas distintas.
         */
        @Test
        @DisplayName("não se reemite por cima de um título ainda ABERTO")
        void origemAbertaRecusada() {
            var aberto = tituloAberto(LocalDate.now());

            assertThatThrownBy(() -> Titulo.substituindo(aberto, LocalDate.now().plusDays(5),
                    new BigDecimal("1350.00"), new BigDecimal("270.00"), "Parcela 1/12"))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("ABERTO");
        }

        @Test
        @DisplayName("a versão cresce de um em um ao longo da cadeia")
        void versaoCresce() {
            var v1 = tituloPago(LocalDate.now());
            assertThat(v1.getVersao()).isEqualTo(1);

            v1.estornar();
            var v2 = Titulo.substituindo(v1, LocalDate.now().plusDays(5),
                    new BigDecimal("1350.00"), new BigDecimal("270.00"), "Parcela 1/12");
            assertThat(v2.getVersao()).isEqualTo(2);
            assertThat(v2.getTituloOrigem()).isSameAs(v1);

            v2.marcarRenegociado();
            var v3 = Titulo.substituindo(v2, LocalDate.now().plusDays(35),
                    new BigDecimal("1350.00"), new BigDecimal("270.00"), "Parcela 1/12 renegociada");
            assertThat(v3.getVersao()).isEqualTo(3);
        }
    }
}
