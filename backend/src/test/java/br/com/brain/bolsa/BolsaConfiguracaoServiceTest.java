package br.com.brain.bolsa;

import br.com.brain.bolsa.dto.AlcadaDescontoRequest;
import br.com.brain.bolsa.dto.EnvelopeBolsaRequest;
import br.com.brain.bolsa.dto.MatrizDescontoRequest;
import br.com.brain.bolsa.dto.PoliticaBolsaRequest;
import br.com.brain.bolsa.dto.TipoBolsaRequest;
import br.com.brain.enums.BaseCalculoEnvelope;
import br.com.brain.enums.NaturezaEnvelope;
import br.com.brain.enums.PerfilNome;
import br.com.brain.enums.UnidadeMedidaEnvelope;
import br.com.brain.exception.ErrosSistema;
import br.com.brain.perfil.Perfil;
import br.com.brain.perfil.PerfilRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * As regras de configuracao que o banco nao expressa.
 *
 * Mock em tudo de proposito: nenhuma destas regras depende de SQL. Sobreposicao
 * de vigencia, integridade temporal e coerencia de unidade de medida sao decisoes
 * de dominio, e testa-las contra banco so deixaria o feedback mais lento sem
 * cobrir mais nada.
 *
 * As datas sao RELATIVAS a hoje, nunca fixas. Fixture com data fixa perto do
 * presente passa ou falha dependendo do dia em que roda -- foi o que aconteceu com
 * o seed da bolsa, que quebrou em setembro por comecar a vigencia em outubro.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("BolsaConfiguracaoService")
class BolsaConfiguracaoServiceTest {

    private static final Long POLITICA = 1L;
    private static final Long TIPO = 2L;
    private static final Long SERIE = 3L;
    private static final LocalDate HOJE = LocalDate.now();
    private static final LocalDate PASSADO = HOJE.minusDays(30);
    private static final LocalDate FUTURO = HOJE.plusDays(30);

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
    private MovimentoEnvelopeRepository movimentoRepository;
    @Mock
    private PerfilRepository perfilRepository;
    @Mock
    private EntityManager entityManager;

    @InjectMocks
    private BolsaConfiguracaoService service;

    // ------------------------------------------------- cruzamento de vigencia

    @Nested
    @DisplayName("cruzamento de vigência")
    class Cruzamento {

        @Test
        @DisplayName("faixas que se encavalam cruzam")
        void encavaladas() {
            assertThat(BolsaConfiguracaoService.vigenciasCruzam(
                    d(1), d(90), d(60), d(150))).isTrue();
        }

        @Test
        @DisplayName("faixas separadas não cruzam")
        void separadas() {
            assertThat(BolsaConfiguracaoService.vigenciasCruzam(
                    d(1), d(90), d(120), d(150))).isFalse();
        }

        /** Um dia em comum já é indefinição: nesse dia as duas regras valem. */
        @Test
        @DisplayName("um único dia em comum já cruza")
        void umDiaEmComum() {
            assertThat(BolsaConfiguracaoService.vigenciasCruzam(
                    d(1), d(90), d(90), d(150))).isTrue();
        }

        /** É assim que `substituir` fecha a anterior: no dia ANTERIOR ao novo início. */
        @Test
        @DisplayName("faixas adjacentes não cruzam")
        void adjacentes() {
            assertThat(BolsaConfiguracaoService.vigenciasCruzam(
                    d(1), d(89), d(90), d(150))).isFalse();
        }

        /**
         * Fim nulo e infinito, nao "termina hoje". Tratar nulo como data faria
         * duas regras abertas parecerem nao se cruzar -- e sao justamente as duas
         * que mais se cruzam.
         */
        @Test
        @DisplayName("duas faixas sem fim sempre cruzam")
        void ambasAbertas() {
            assertThat(BolsaConfiguracaoService.vigenciasCruzam(
                    d(1), null, d(500), null)).isTrue();
        }

        @Test
        @DisplayName("faixa sem fim engole qualquer faixa posterior")
        void abertaEngolePosterior() {
            assertThat(BolsaConfiguracaoService.vigenciasCruzam(
                    d(1), null, d(200), d(300))).isTrue();
        }

        @Test
        @DisplayName("faixa fechada antes de uma faixa aberta não cruza")
        void fechadaAntesDeAberta() {
            assertThat(BolsaConfiguracaoService.vigenciasCruzam(
                    d(1), d(50), d(100), null)).isFalse();
        }

        private LocalDate d(int dia) {
            return LocalDate.of(2030, 1, 1).plusDays(dia);
        }
    }

    // ---------------------------------------------------- sobreposicao na matriz

    @Test
    @DisplayName("matriz: mesmo escopo com vigência cruzada é recusada")
    void matrizSobrepostaRecusada() {
        when(matrizRepository.findByPoliticaIdAndTipoBolsaIdOrderByIdAsc(POLITICA, TIPO))
                .thenReturn(List.of(matrizExistente(99L, null, null, "60.00", PASSADO, null)));

        assertThatThrownBy(() -> service.criarMatriz(
                pedidoMatriz(null, null, "50.00", HOJE, null)))
                .isInstanceOf(ErrosSistema.OperacaoInvalidaException.class)
                .hasMessageContaining("Já existe uma regra de 60.00%");

        verify(matrizRepository, never()).save(any());
    }

    /**
     * A regra geral e a da serie se sobrepoem no tempo DE PROPOSITO: e para isso
     * que a especificidade existe, e a da serie vence. Barrar isto tornaria a
     * matriz inutil.
     */
    @Test
    @DisplayName("matriz: escopos diferentes convivem no mesmo período")
    void escoposDiferentesConvivem() {
        when(matrizRepository.findByPoliticaIdAndTipoBolsaIdOrderByIdAsc(POLITICA, TIPO))
                .thenReturn(List.of(matrizExistente(99L, null, null, "60.00", PASSADO, null)));
        when(politicaRepository.findById(POLITICA)).thenReturn(Optional.of(politica()));
        when(tipoBolsaRepository.findById(TIPO)).thenReturn(Optional.of(tipo()));
        when(matrizRepository.save(any())).thenAnswer(i -> salvaComId(i.getArgument(0)));

        assertThatCode(() -> service.criarMatriz(
                pedidoMatriz(null, SERIE, "40.00", HOJE, null)))
                .doesNotThrowAnyException();

        verify(matrizRepository).save(any());
    }

    @Test
    @DisplayName("matriz: vigência que termina antes de começar é recusada")
    void vigenciaInvertidaRecusada() {
        assertThatThrownBy(() -> service.criarMatriz(
                pedidoMatriz(null, null, "50.00", FUTURO, HOJE)))
                .isInstanceOf(ErrosSistema.DataInvalidaException.class);
    }

    // ------------------------------------------------------ integridade temporal

    /**
     * O teto e calculado na DATA DA PROPOSTA. Editar o percentual de uma regra que
     * ja valia faria uma proposta antiga passar a ser avaliada por uma regra que
     * nao existia quando foi feita.
     */
    @Test
    @DisplayName("matriz em vigor não se edita no lugar")
    void matrizEmVigorNaoEdita() {
        when(matrizRepository.findById(99L))
                .thenReturn(Optional.of(matrizExistente(99L, null, null, "60.00", PASSADO, null)));

        assertThatThrownBy(() -> service.atualizarMatriz(99L,
                pedidoMatriz(null, null, "80.00", PASSADO, null)))
                .isInstanceOf(ErrosSistema.OperacaoInvalidaException.class)
                .hasMessageContaining("substituir");
    }

    @Test
    @DisplayName("matriz que ainda não entrou em vigor edita livremente")
    void matrizFuturaEdita() {
        when(matrizRepository.findById(99L))
                .thenReturn(Optional.of(matrizExistente(99L, null, null, "60.00", FUTURO, null)));
        when(matrizRepository.findByPoliticaIdAndTipoBolsaIdOrderByIdAsc(POLITICA, TIPO))
                .thenReturn(List.of());
        when(politicaRepository.findById(POLITICA)).thenReturn(Optional.of(politica()));
        when(tipoBolsaRepository.findById(TIPO)).thenReturn(Optional.of(tipo()));

        var dto = service.atualizarMatriz(99L, pedidoMatriz(null, null, "80.00", FUTURO, null));

        assertThat(dto.percentualMax()).isEqualByComparingTo("80.00");
    }

    @Test
    @DisplayName("substituir encerra a anterior no dia anterior ao novo início")
    void substituirEncerraNoDiaAnterior() {
        var atual = matrizExistente(99L, null, null, "60.00", PASSADO, null);
        when(matrizRepository.findById(99L)).thenReturn(Optional.of(atual));
        when(matrizRepository.findByPoliticaIdAndTipoBolsaIdOrderByIdAsc(POLITICA, TIPO))
                .thenReturn(List.of(atual));
        when(politicaRepository.findById(POLITICA)).thenReturn(Optional.of(politica()));
        when(tipoBolsaRepository.findById(TIPO)).thenReturn(Optional.of(tipo()));
        when(matrizRepository.save(any())).thenAnswer(i -> salvaComId(i.getArgument(0)));

        service.substituirMatriz(99L, pedidoMatriz(null, null, "40.00", FUTURO, null));

        // Nem um dia em comum: com o fim no proprio dia de inicio da nova, as duas
        // casariam naquela data e o teto voltaria a ser indefinido.
        assertThat(atual.getVigenciaFim()).isEqualTo(FUTURO.minusDays(1));
    }

    @Test
    @DisplayName("substituir exige que a nova regra comece depois da atual")
    void substituirExigeInicioPosterior() {
        when(matrizRepository.findById(99L))
                .thenReturn(Optional.of(matrizExistente(99L, null, null, "60.00", FUTURO, null)));

        assertThatThrownBy(() -> service.substituirMatriz(99L,
                pedidoMatriz(null, null, "40.00", PASSADO, null)))
                .isInstanceOf(ErrosSistema.OperacaoInvalidaException.class)
                .hasMessageContaining("precisa começar depois");
    }

    // ------------------------------------------------------------- identidades

    @Test
    @DisplayName("ano letivo da política não muda")
    void anoLetivoNaoMuda() {
        when(politicaRepository.findById(POLITICA)).thenReturn(Optional.of(politica()));

        assertThatThrownBy(() -> service.atualizarPolitica(POLITICA,
                new PoliticaBolsaRequest(2099, false, null)))
                .isInstanceOf(ErrosSistema.OperacaoInvalidaException.class)
                .hasMessageContaining("identidade");
    }

    @Test
    @DisplayName("código do tipo de bolsa não muda")
    void codigoDoTipoNaoMuda() {
        when(tipoBolsaRepository.findById(TIPO)).thenReturn(Optional.of(tipo()));

        assertThatThrownBy(() -> service.atualizarTipo(TIPO,
                new TipoBolsaRequest("SOC", "Social", true, false, true, true, true, null)))
                .isInstanceOf(ErrosSistema.OperacaoInvalidaException.class)
                .hasMessageContaining("não muda");
    }

    @Test
    @DisplayName("alçada de perfil inexistente é recusada")
    void alcadaDePerfilInexistente() {
        when(politicaRepository.findById(POLITICA)).thenReturn(Optional.of(politica()));
        when(perfilRepository.findByNome(PerfilNome.DIRETOR)).thenReturn(null);

        assertThatThrownBy(() -> service.definirAlcada(
                new AlcadaDescontoRequest(POLITICA, PerfilNome.DIRETOR, new BigDecimal("100.00"), true)))
                .isInstanceOf(ErrosSistema.RecursoNaoEncontradoException.class);
    }

    /** O banco tem UNIQUE (politica, perfil): definir duas vezes ajusta, não duplica. */
    @Test
    @DisplayName("alçada repetida do mesmo perfil ajusta a existente")
    void alcadaRepetidaAjusta() {
        var existente = new AlcadaDesconto();
        existente.setId(7L);
        existente.setPolitica(politica());
        existente.setPerfil(perfil(PerfilNome.DIRETOR));
        existente.setPercentualMax(new BigDecimal("50.00"));

        when(politicaRepository.findById(POLITICA)).thenReturn(Optional.of(politica()));
        when(perfilRepository.findByNome(PerfilNome.DIRETOR)).thenReturn(perfil(PerfilNome.DIRETOR));
        when(alcadaRepository.buscarDoPerfil(POLITICA, PerfilNome.DIRETOR)).thenReturn(Optional.of(existente));
        when(alcadaRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        var dto = service.definirAlcada(
                new AlcadaDescontoRequest(POLITICA, PerfilNome.DIRETOR, new BigDecimal("100.00"), true));

        assertThat(dto.id()).isEqualTo(7L);
        assertThat(dto.percentualMax()).isEqualByComparingTo("100.00");
    }

    // ----------------------------------------------------- coerencia de envelope

    @Test
    @DisplayName("envelope percentual sem base de cálculo é recusado")
    void percentualSemBase() {
        assertThatThrownBy(() -> service.criarEnvelope(envelope(
                UnidadeMedidaEnvelope.PERCENTUAL_RECEITA, null, "10.00", null, null)))
                .isInstanceOf(ErrosSistema.OperacaoInvalidaException.class)
                .hasMessageContaining("base de cálculo");
    }

    @Test
    @DisplayName("envelope em valor absoluto sem limite é recusado")
    void valorAbsolutoSemLimite() {
        assertThatThrownBy(() -> service.criarEnvelope(envelope(
                UnidadeMedidaEnvelope.VALOR_ABSOLUTO, null, null, null, null)))
                .isInstanceOf(ErrosSistema.OperacaoInvalidaException.class)
                .hasMessageContaining("limite em R$");
    }

    /** "Sem teto adicional" é cenário válido — mas então não se preenche limite. */
    @Test
    @DisplayName("envelope sem limite não aceita limite preenchido")
    void semLimiteComLimite() {
        assertThatThrownBy(() -> service.criarEnvelope(envelope(
                UnidadeMedidaEnvelope.SEM_LIMITE, "1000.00", null, null, null)))
                .isInstanceOf(ErrosSistema.OperacaoInvalidaException.class)
                .hasMessageContaining("não aceita nenhum valor de limite");
    }

    @Test
    @DisplayName("piso mínimo sem limite não quer dizer nada")
    void pisoSemLimite() {
        var pedido = new EnvelopeBolsaRequest(POLITICA, "Piso CEBAS",
                NaturezaEnvelope.META_MINIMA, UnidadeMedidaEnvelope.SEM_LIMITE,
                null, null, null, null, null, null, null, null, true);

        assertThatThrownBy(() -> service.criarEnvelope(pedido))
                .isInstanceOf(ErrosSistema.OperacaoInvalidaException.class)
                .hasMessageContaining("piso mínimo sem limite");
    }

    /**
     * reservado/comprometido estao gravados numa unidade. Trocar a unidade faria
     * "2880" deixar de ser reais e passar a ser numero de bolsas, sem conversao e
     * sem erro -- o saldo passaria a mentir calado.
     */
    @Test
    @DisplayName("envelope com consumo não troca de unidade de medida")
    void naoTrocaUnidadeComConsumo() {
        when(envelopeRepository.findById(5L)).thenReturn(Optional.of(envelopeSalvo()));
        when(movimentoRepository.countByEnvelopeId(5L)).thenReturn(3L);

        assertThatThrownBy(() -> service.atualizarEnvelope(5L, envelope(
                UnidadeMedidaEnvelope.QUANTIDADE_EQUIVALENTE, null, null, "10.00", null)))
                .isInstanceOf(ErrosSistema.OperacaoInvalidaException.class)
                .hasMessageContaining("unidade de medida");
    }

    @Test
    @DisplayName("envelope com consumo não troca de natureza: teto viraria piso")
    void naoTrocaNaturezaComConsumo() {
        when(envelopeRepository.findById(5L)).thenReturn(Optional.of(envelopeSalvo()));
        when(movimentoRepository.countByEnvelopeId(5L)).thenReturn(3L);

        var pedido = new EnvelopeBolsaRequest(POLITICA, "Comercial",
                NaturezaEnvelope.META_MINIMA, UnidadeMedidaEnvelope.VALOR_ABSOLUTO,
                new BigDecimal("400000.00"), null, null, null, null, null, null, null, true);

        assertThatThrownBy(() -> service.atualizarEnvelope(5L, pedido))
                .isInstanceOf(ErrosSistema.OperacaoInvalidaException.class)
                .hasMessageContaining("teto passaria a ser piso");
    }

    /** Levantar o teto no meio da campanha é o uso normal de um orçamento. */
    @Test
    @DisplayName("limite muda livremente, mesmo com consumo")
    void limiteMudaComConsumo() {
        when(envelopeRepository.findById(5L)).thenReturn(Optional.of(envelopeSalvo()));
        when(movimentoRepository.countByEnvelopeId(5L)).thenReturn(3L);

        var dto = service.atualizarEnvelope(5L, envelope(
                UnidadeMedidaEnvelope.VALOR_ABSOLUTO, "500000.00", null, null, null));

        assertThat(dto.valorLimite()).isEqualByComparingTo("500000.00");
    }

    @Test
    @DisplayName("envelope já usado não se exclui — desativa")
    void envelopeUsadoNaoExclui() {
        when(envelopeRepository.findById(5L)).thenReturn(Optional.of(envelopeSalvo()));
        when(movimentoRepository.countByEnvelopeId(5L)).thenReturn(1L);

        assertThatThrownBy(() -> service.excluirEnvelope(5L))
                .isInstanceOf(ErrosSistema.OperacaoInvalidaException.class)
                .hasMessageContaining("Desative-o");

        verify(envelopeRepository, never()).delete(any());
    }

    @Test
    @DisplayName("envelope nunca usado pode ser excluído de verdade")
    void envelopeNovoExclui() {
        var envelope = envelopeSalvo();
        when(envelopeRepository.findById(5L)).thenReturn(Optional.of(envelope));
        when(movimentoRepository.countByEnvelopeId(5L)).thenReturn(0L);

        service.excluirEnvelope(5L);

        verify(envelopeRepository).delete(envelope);
    }

    // -------------------------------------------------------------------- apoio

    private PoliticaBolsa politica() {
        var p = new PoliticaBolsa();
        p.setId(POLITICA);
        p.setAnoLetivo(2027);
        return p;
    }

    private TipoBolsa tipo() {
        var t = new TipoBolsa();
        t.setId(TIPO);
        t.setCodigo("SOCIAL");
        t.setNome("Bolsa Social");
        return t;
    }

    private Perfil perfil(PerfilNome nome) {
        var p = new Perfil();
        p.setId(10L);
        p.setNome(nome);
        return p;
    }

    private MatrizDesconto matrizExistente(Long id, Long unidadeId, Long serieId,
            String percentual, LocalDate inicio, LocalDate fim) {
        var m = new MatrizDesconto();
        m.setId(id);
        m.setPolitica(politica());
        m.setTipoBolsa(tipo());
        m.setPercentualMax(new BigDecimal(percentual));
        m.setVigenciaInicio(inicio);
        m.setVigenciaFim(fim);
        if (serieId != null) {
            var s = new br.com.brain.serie.Serie();
            s.setId(serieId);
            m.setSerie(s);
        }
        if (unidadeId != null) {
            var u = new br.com.brain.unidade.Unidade();
            u.setId(unidadeId);
            m.setUnidade(u);
        }
        return m;
    }

    private MatrizDescontoRequest pedidoMatriz(Long unidadeId, Long serieId,
            String percentual, LocalDate inicio, LocalDate fim) {
        return new MatrizDescontoRequest(POLITICA, TIPO, unidadeId, serieId,
                new BigDecimal(percentual), inicio, fim);
    }

    private EnvelopeBolsa envelopeSalvo() {
        var e = new EnvelopeBolsa();
        e.setId(5L);
        e.setPolitica(politica());
        e.setNome("Comercial 2027");
        e.setNatureza(NaturezaEnvelope.LIMITE_MAXIMO);
        e.setUnidadeMedida(UnidadeMedidaEnvelope.VALOR_ABSOLUTO);
        e.setValorLimite(new BigDecimal("400000.00"));
        return e;
    }

    private EnvelopeBolsaRequest envelope(UnidadeMedidaEnvelope medida,
            String valorLimite, String percentualLimite, String quantidadeLimite,
            BaseCalculoEnvelope base) {
        return new EnvelopeBolsaRequest(
                POLITICA,
                "Comercial 2027",
                NaturezaEnvelope.LIMITE_MAXIMO,
                medida,
                valorLimite == null ? null : new BigDecimal(valorLimite),
                percentualLimite == null ? null : new BigDecimal(percentualLimite),
                quantidadeLimite == null ? null : new BigDecimal(quantidadeLimite),
                base,
                null, null, null, null, true);
    }

    /** Imita o IDENTITY do banco: save devolve a entidade com id. */
    private static MatrizDesconto salvaComId(MatrizDesconto matriz) {
        matriz.setId(100L);
        return matriz;
    }
}
