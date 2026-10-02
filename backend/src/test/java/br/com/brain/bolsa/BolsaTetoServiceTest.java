package br.com.brain.bolsa;

import br.com.brain.bolsa.dto.TetoConcessaoDto;
import br.com.brain.bolsa.dto.TetoConcessaoDto.LimiteAtingido;
import br.com.brain.enums.BaseCalculoEnvelope;
import br.com.brain.enums.NaturezaEnvelope;
import br.com.brain.enums.NaturezaProduto;
import br.com.brain.enums.PerfilNome;
import br.com.brain.enums.Turno;
import br.com.brain.enums.UnidadeMedidaEnvelope;
import br.com.brain.exception.ErrosSistema.OperacaoInvalidaException;
import br.com.brain.perfil.Perfil;
import br.com.brain.produto.Produto;
import br.com.brain.produto.ProdutoModalidade;
import br.com.brain.produto.ProdutoPreco;
import br.com.brain.produto.ProdutoPrecoRepository;
import br.com.brain.serie.Serie;
import br.com.brain.unidade.Unidade;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

/**
 * O teto de bolsa e o numero que o funcionario ve antes de prometer desconto a
 * um pai. Errar para cima e prometer o que o orcamento nao tem; errar para baixo
 * e perder matricula. Os tres limites sao independentes e vale o menor, entao o
 * que este teste protege e justamente o "menor" — e a explicacao de qual dos
 * tres esta segurando, que e o que a tela mostra quando alguem pergunta por que.
 *
 * Os cenarios espelham os que rodavam em SQL antes da regra vir para o servico.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("BolsaTetoService")
class BolsaTetoServiceTest {

    private static final Integer ANO = 2027;
    private static final Long TIPO_ID = 10L;
    private static final Long UNIDADE_ID = 1L;
    private static final Long SERIE_ID = 3L;
    private static final Long POLITICA_ID = 100L;
    private static final LocalDate PROPOSTA = LocalDate.of(2026, 11, 1);

    /** Mensalidade de R$ 1.200 x 12 parcelas. */
    private static final BigDecimal ANUIDADE = new BigDecimal("14400.00");

    @Mock
    private PoliticaBolsaRepository politicaRepository;
    @Mock
    private TipoBolsaRepository tipoBolsaRepository;
    @Mock
    private MatrizDescontoRepository matrizRepository;
    @Mock
    private AlcadaDescontoRepository alcadaRepository;
    @Mock
    private EnvelopeBolsaRepository envelopeRepository;
    @Mock
    private ProdutoPrecoRepository precoRepository;

    @InjectMocks
    private BolsaTetoService service;

    private PoliticaBolsa politica;
    private TipoBolsa tipoBolsa;
    private Produto mensalidade;

    @BeforeEach
    void setUp() {
        autenticarComPerfis(PerfilNome.SECRETARIO);

        politica = new PoliticaBolsa();
        politica.setId(POLITICA_ID);
        politica.setAnoLetivo(ANO);

        mensalidade = new Produto();
        mensalidade.setId(500L);
        mensalidade.setNome("Mensalidade");
        mensalidade.setAtivo(true);
        mensalidade.setPermiteBolsa(true);
        mensalidade.setNatureza(NaturezaProduto.RECORRENTE);

        tipoBolsa = new TipoBolsa();
        tipoBolsa.setId(TIPO_ID);
        tipoBolsa.setCodigo("SOCIAL");
        tipoBolsa.setNome("Bolsa social");
        tipoBolsa.setAtivo(true);
        tipoBolsa.setProdutos(List.of(mensalidade));

        lenient().when(politicaRepository.findByAnoLetivo(ANO)).thenReturn(Optional.of(politica));
        lenient().when(tipoBolsaRepository.buscarComProdutos(TIPO_ID)).thenReturn(Optional.of(tipoBolsa));
        lenient().when(precoRepository.buscarVigentes(anyList(), any(), any(), any(), any(), any()))
                .thenReturn(List.of(preco(new BigDecimal("1200.00"), null, null)));
        lenient().when(envelopeRepository.buscarDoEscopo(any(), any(), any(), any(), any()))
                .thenReturn(List.of());
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    // ------------------------------------------------------------------ apoio

    private void autenticarComPerfis(PerfilNome... nomes) {
        List<GrantedAuthority> perfis = Arrays.stream(nomes).map(nome -> {
            var perfil = new Perfil();
            perfil.setNome(nome);
            return (GrantedAuthority) perfil;
        }).toList();
        SecurityContextHolder.getContext()
                .setAuthentication(new UsernamePasswordAuthenticationToken("secretaria", "x", perfis));
    }

    private ProdutoPreco preco(BigDecimal valor, Serie serie, Unidade unidade) {
        var modalidade = new ProdutoModalidade();
        modalidade.setId(700L);
        modalidade.setProduto(mensalidade);
        modalidade.setAtivo(true);

        var preco = new ProdutoPreco();
        preco.setId(800L);
        preco.setModalidade(modalidade);
        preco.setValor(valor);
        preco.setSerie(serie);
        preco.setUnidade(unidade);
        preco.setVigenciaInicio(LocalDate.of(2026, 10, 1));
        return preco;
    }

    private MatrizDesconto matriz(String percentual, Serie serie, Unidade unidade) {
        var regra = new MatrizDesconto();
        regra.setPolitica(politica);
        regra.setTipoBolsa(tipoBolsa);
        regra.setPercentualMax(new BigDecimal(percentual));
        regra.setSerie(serie);
        regra.setUnidade(unidade);
        regra.setVigenciaInicio(LocalDate.of(2026, 10, 1));
        return regra;
    }

    private AlcadaDesconto alcada(String percentual, PerfilNome nome) {
        var perfil = new Perfil();
        perfil.setNome(nome);
        var alcada = new AlcadaDesconto();
        alcada.setPolitica(politica);
        alcada.setPerfil(perfil);
        alcada.setPercentualMax(new BigDecimal(percentual));
        return alcada;
    }

    private EnvelopeBolsa envelope(UnidadeMedidaEnvelope medida, String nome) {
        var envelope = new EnvelopeBolsa();
        envelope.setId(900L);
        envelope.setNome(nome);
        envelope.setPolitica(politica);
        envelope.setNatureza(NaturezaEnvelope.LIMITE_MAXIMO);
        envelope.setUnidadeMedida(medida);
        envelope.setAtivo(true);
        envelope.setPermiteExcedente(true);
        return envelope;
    }

    private void comMatriz(MatrizDesconto... regras) {
        when(matrizRepository.buscarVigentes(eq(POLITICA_ID), eq(TIPO_ID), eq(UNIDADE_ID), eq(SERIE_ID), any()))
                .thenReturn(List.of(regras));
    }

    private void comAlcada(AlcadaDesconto... alcadas) {
        when(alcadaRepository.buscarPorPerfis(eq(POLITICA_ID), any())).thenReturn(List.of(alcadas));
    }

    private void comEnvelope(EnvelopeBolsa envelope) {
        when(envelopeRepository.buscarDoEscopo(
                eq(POLITICA_ID), eq(NaturezaEnvelope.LIMITE_MAXIMO), eq(UNIDADE_ID), eq(SERIE_ID), eq(TIPO_ID)))
                .thenReturn(List.of(envelope));
    }

    private TetoConcessaoDto calcular() {
        return service.calcular(ANO, TIPO_ID, UNIDADE_ID, SERIE_ID, Turno.MATUTINO, 12, PROPOSTA);
    }

    // ----------------------------------------------------------------- testes

    @Test
    @DisplayName("vale o menor dos tres: com matriz 60% e alcada 20%, concede 20%")
    void menorDosTresVence() {
        comMatriz(matriz("60.00", null, null));
        comAlcada(alcada("20.00", PerfilNome.SECRETARIO));

        var teto = calcular();

        assertThat(teto.valorCheioAnual()).isEqualByComparingTo(ANUIDADE);
        assertThat(teto.tetoMatrizPct()).isEqualByComparingTo("60.00");
        assertThat(teto.tetoAlcadaPct()).isEqualByComparingTo("20.00");
        assertThat(teto.tetoEnvelopePct()).isEqualByComparingTo("100.00");
        assertThat(teto.podeConcederPct()).isEqualByComparingTo("20.00");
        assertThat(teto.podeConcederValor()).isEqualByComparingTo("2880.00");
        assertThat(teto.limiteAtingido()).isEqualTo(LimiteAtingido.ALCADA);
    }

    @Test
    @DisplayName("sem envelope de teto, o orcamento nao restringe e a matriz manda")
    void semEnvelopeCaiNaMatriz() {
        comMatriz(matriz("50.00", null, null));
        comAlcada(alcada("100.00", PerfilNome.DIRETOR));

        var teto = calcular();

        assertThat(teto.tetoEnvelopePct()).isEqualByComparingTo("100.00");
        assertThat(teto.podeConcederPct()).isEqualByComparingTo("50.00");
        assertThat(teto.limiteAtingido()).isEqualTo(LimiteAtingido.MATRIZ);
        assertThat(teto.envelopeRestritivo()).isNull();
    }

    @Test
    @DisplayName("a regra de matriz mais especifica vence a geral")
    void matrizMaisEspecificaVence() {
        var serie = new Serie();
        serie.setId(SERIE_ID);
        comMatriz(matriz("60.00", null, null), matriz("40.00", serie, null));
        comAlcada(alcada("100.00", PerfilNome.DIRETOR));

        var teto = calcular();

        assertThat(teto.tetoMatrizPct()).isEqualByComparingTo("40.00");
        assertThat(teto.podeConcederPct()).isEqualByComparingTo("40.00");
    }

    @Test
    @DisplayName("sem regra na matriz nao se concede nada: ausencia nao e permissao")
    void semRegraNaMatrizNaoConcede() {
        comMatriz();
        comAlcada(alcada("100.00", PerfilNome.DIRETOR));

        var teto = calcular();

        assertThat(teto.tetoMatrizPct()).isEqualByComparingTo("0.00");
        assertThat(teto.podeConcederPct()).isEqualByComparingTo("0.00");
        assertThat(teto.podeConcederValor()).isEqualByComparingTo("0.00");
    }

    @Test
    @DisplayName("quem acumula perfis fica com a maior alcada")
    void perfisAcumuladosUsamAMaiorAlcada() {
        autenticarComPerfis(PerfilNome.SECRETARIO, PerfilNome.DIRETOR);
        comMatriz(matriz("100.00", null, null));
        comAlcada(alcada("20.00", PerfilNome.SECRETARIO), alcada("80.00", PerfilNome.DIRETOR));

        var teto = calcular();

        assertThat(teto.tetoAlcadaPct()).isEqualByComparingTo("80.00");
    }

    @Test
    @DisplayName("envelope em reais aperta o teto e aparece como limite atingido")
    void envelopeEmReaisRestringe() {
        comMatriz(matriz("60.00", null, null));
        comAlcada(alcada("100.00", PerfilNome.DIRETOR));

        var envelope = envelope(UnidadeMedidaEnvelope.VALOR_ABSOLUTO, "Comercial 2027");
        envelope.setValorLimite(new BigDecimal("2000.00"));
        envelope.setComprometido(new BigDecimal("560.00"));
        comEnvelope(envelope);

        // sobra 1440 de orcamento; 1440 / 14400 = 10% da anuidade deste aluno
        var teto = calcular();

        assertThat(teto.tetoEnvelopePct()).isEqualByComparingTo("10.00");
        assertThat(teto.podeConcederPct()).isEqualByComparingTo("10.00");
        assertThat(teto.podeConcederValor()).isEqualByComparingTo("1440.00");
        assertThat(teto.limiteAtingido()).isEqualTo(LimiteAtingido.ENVELOPE);
        assertThat(teto.envelopeRestritivo()).isNotNull();
        assertThat(teto.envelopeRestritivo().nome()).isEqualTo("Comercial 2027");
        assertThat(teto.envelopeRestritivo().saldo()).isEqualByComparingTo("1440.00");
    }

    @Test
    @DisplayName("envelope esgotado zera o teto, sem ficar negativo")
    void envelopeEsgotadoNaoFicaNegativo() {
        comMatriz(matriz("60.00", null, null));
        comAlcada(alcada("100.00", PerfilNome.DIRETOR));

        var envelope = envelope(UnidadeMedidaEnvelope.VALOR_ABSOLUTO, "Social 2027");
        envelope.setValorLimite(new BigDecimal("1000.00"));
        envelope.setComprometido(new BigDecimal("1500.00"));
        comEnvelope(envelope);

        var teto = calcular();

        assertThat(teto.tetoEnvelopePct()).isEqualByComparingTo("0.00");
        assertThat(teto.podeConcederPct()).isEqualByComparingTo("0.00");
    }

    @Test
    @DisplayName("teto percentual sobre receita projetada nao depende de contrato nenhum")
    void envelopePercentualComReceitaProjetada() {
        comMatriz(matriz("100.00", null, null));
        comAlcada(alcada("100.00", PerfilNome.DIRETOR));

        var envelope = envelope(UnidadeMedidaEnvelope.PERCENTUAL_RECEITA, "Teto 5% da meta");
        envelope.setPercentualLimite(new BigDecimal("5.00"));
        envelope.setBaseCalculo(BaseCalculoEnvelope.RECEITA_PROJETADA);
        envelope.setReceitaProjetada(new BigDecimal("100000.00"));
        comEnvelope(envelope);

        // teto = 5% de 100.000 = 5.000; 5.000 / 14.400 = 34,72%
        var teto = calcular();

        assertThat(teto.envelopeRestritivo().teto()).isEqualByComparingTo("5000.00");
        assertThat(teto.tetoEnvelopePct()).isEqualByComparingTo("34.72");
    }

    @Test
    @DisplayName("teto percentual sobre receita realizada acompanha os contratos vigentes")
    void envelopePercentualComReceitaRealizada() {
        comMatriz(matriz("100.00", null, null));
        comAlcada(alcada("100.00", PerfilNome.DIRETOR));

        var envelope = envelope(UnidadeMedidaEnvelope.PERCENTUAL_RECEITA, "Teto 5% da receita");
        envelope.setPercentualLimite(new BigDecimal("5.00"));
        envelope.setBaseCalculo(BaseCalculoEnvelope.RECEITA_REALIZADA);
        comEnvelope(envelope);

        when(envelopeRepository.somarReceitaRealizada(eq(ANO), any(), any()))
                .thenReturn(new BigDecimal("200000.00"));

        // teto = 5% de 200.000 = 10.000; 10.000 / 14.400 = 69,44%
        var teto = calcular();

        assertThat(teto.envelopeRestritivo().teto()).isEqualByComparingTo("10000.00");
        assertThat(teto.tetoEnvelopePct()).isEqualByComparingTo("69.44");
    }

    @Test
    @DisplayName("receita realizada zerada trava a concessao: e por isso que existe a projetada")
    void receitaRealizadaZeradaTravaTudo() {
        comMatriz(matriz("100.00", null, null));
        comAlcada(alcada("100.00", PerfilNome.DIRETOR));

        var envelope = envelope(UnidadeMedidaEnvelope.PERCENTUAL_RECEITA, "Teto 20% da receita");
        envelope.setPercentualLimite(new BigDecimal("20.00"));
        envelope.setBaseCalculo(BaseCalculoEnvelope.RECEITA_REALIZADA);
        comEnvelope(envelope);

        when(envelopeRepository.somarReceitaRealizada(eq(ANO), any(), any())).thenReturn(BigDecimal.ZERO);

        var teto = calcular();

        assertThat(teto.podeConcederPct()).isEqualByComparingTo("0.00");
    }

    @Test
    @DisplayName("envelope em bolsas equivalentes: 0,30 restante vira teto de 30%")
    void envelopeEmQuantidadeEquivalente() {
        comMatriz(matriz("100.00", null, null));
        comAlcada(alcada("100.00", PerfilNome.DIRETOR));

        var envelope = envelope(UnidadeMedidaEnvelope.QUANTIDADE_EQUIVALENTE, "Piso CEBAS 2027");
        envelope.setQuantidadeLimite(new BigDecimal("2.00"));
        envelope.setComprometidoEquiv(new BigDecimal("1.70"));
        comEnvelope(envelope);

        var teto = calcular();

        assertThat(teto.tetoEnvelopePct()).isEqualByComparingTo("30.00");
        assertThat(teto.envelopeRestritivo().saldoEquivalente()).isEqualByComparingTo("0.30");
    }

    @Test
    @DisplayName("envelope SEM_LIMITE so mede, nao restringe")
    void envelopeSemLimiteNaoRestringe() {
        comMatriz(matriz("45.00", null, null));
        comAlcada(alcada("100.00", PerfilNome.DIRETOR));

        comEnvelope(envelope(UnidadeMedidaEnvelope.SEM_LIMITE, "Acompanhamento 2027"));

        var teto = calcular();

        assertThat(teto.tetoEnvelopePct()).isEqualByComparingTo("100.00");
        assertThat(teto.podeConcederPct()).isEqualByComparingTo("45.00");
        assertThat(teto.limiteAtingido()).isEqualTo(LimiteAtingido.MATRIZ);
    }

    @Test
    @DisplayName("arredonda para baixo: teto e limite, nunca concede o centavo a mais")
    void arredondaParaBaixo() {
        comMatriz(matriz("100.00", null, null));
        comAlcada(alcada("100.00", PerfilNome.DIRETOR));

        var envelope = envelope(UnidadeMedidaEnvelope.VALOR_ABSOLUTO, "Comercial 2027");
        envelope.setValorLimite(new BigDecimal("1000.00"));
        comEnvelope(envelope);

        // 1000 / 14400 = 6,9444...% -> 6,94 e nao 6,95
        var teto = calcular();

        assertThat(teto.tetoEnvelopePct()).isEqualByComparingTo("6.94");
        assertThat(teto.podeConcederValor()).isEqualByComparingTo("999.36");
    }

    @Test
    @DisplayName("sem preco vigente para a serie, recusa em vez de calcular sobre zero")
    void semPrecoVigenteRecusa() {
        when(precoRepository.buscarVigentes(anyList(), any(), any(), any(), any(), any()))
                .thenReturn(List.of());

        assertThatThrownBy(this::calcular)
                .isInstanceOf(OperacaoInvalidaException.class)
                .hasMessageContaining("preço vigente");
    }

    @Test
    @DisplayName("tipo de bolsa sem produto elegivel recusa, em vez de devolver teto zerado sem explicacao")
    void tipoSemProdutoElegivelRecusa() {
        tipoBolsa.setProdutos(List.of());

        assertThatThrownBy(this::calcular)
                .isInstanceOf(OperacaoInvalidaException.class)
                .hasMessageContaining("elegível à bolsa");
    }

    @Test
    @DisplayName("usuario sem alcada cadastrada nao concede nada")
    void semAlcadaNaoConcede() {
        comMatriz(matriz("60.00", null, null));
        comAlcada();

        var teto = calcular();

        assertThat(teto.tetoAlcadaPct()).isEqualByComparingTo("0.00");
        assertThat(teto.podeConcederPct()).isEqualByComparingTo("0.00");
        assertThat(teto.limiteAtingido()).isEqualTo(LimiteAtingido.ALCADA);
    }
}
