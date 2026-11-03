package br.com.brain.produto;

import br.com.brain.dadosPessoais.DadosPessoais;
import br.com.brain.enums.StatusProdutoPreco;
import br.com.brain.exception.ErrosSistema;
import br.com.brain.produto.dto.CadastroProdutoPrecoDto;
import br.com.brain.produto.dto.DecisaoPrecoRequest;
import br.com.brain.serie.Serie;
import br.com.brain.serie.SerieRepository;
import br.com.brain.unidade.UnidadeRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.AuditorAware;

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
 * A regra que impede dois precos valendo ao mesmo tempo para o mesmo escopo.
 *
 * Isso nao e preciosismo: com duas linhas vigentes e identicas em dimensao, o
 * desempate por especificidade empata, o sistema escolhe uma pela ordem em que
 * voltaram do banco, e a familia recebe um boleto que ninguem sabe explicar.
 *
 * Escopos DIFERENTES podem e devem se sobrepor -- e assim que "geral 1.200, mas
 * 6o ano 1.350" funciona. Metade destes testes existe para garantir que a regra
 * nao atrapalha esse caso.
 *
 * Datas relativas a hoje, nunca fixas.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("ProdutoPrecoService")
class ProdutoPrecoServiceTest {

    private static final Long MODALIDADE = 10L;

    @Mock
    private ProdutoPrecoRepository precoRepository;

    @Mock
    private ProdutoModalidadeRepository modalidadeRepository;

    @Mock
    private UnidadeRepository unidadeRepository;

    @Mock
    private SerieRepository serieRepository;

    /**
     * Cadastrar preco agora grava QUEM pediu o reajuste, entao o servico precisa
     * saber quem esta logado. So os testes que chegam a gravar stubam isto: os
     * que recusam antes nunca passam pelo usuarioAtual(), e stub nao usado e
     * erro no Mockito estrito.
     */
    @Mock
    private AuditorAware<Long> auditor;

    @Mock
    private EntityManager entityManager;

    @InjectMocks
    private ProdutoPrecoService service;

    private static final Long USUARIO = 99L;

    // ------------------------------------------------------------- fixtures

    private ProdutoPreco precoExistente(String valor, LocalDate inicio, LocalDate fim, Serie serie) {
        var modalidade = new ProdutoModalidade();
        modalidade.setId(MODALIDADE);

        var preco = new ProdutoPreco();
        preco.setId(1L);
        preco.setModalidade(modalidade);
        preco.setValor(new BigDecimal(valor));
        preco.setVigenciaInicio(inicio);
        preco.setVigenciaFim(fim);
        preco.setSerie(serie);
        // Preco que JA existe na tabela esta aprovado: e so aprovado que
        // precifica, logo so aprovado disputa escopo e so aprovado pode ter
        // precificado um contrato -- que e o motivo de nao poder ser apagado.
        preco.setStatus(StatusProdutoPreco.APROVADO);
        return preco;
    }

    /** Um reajuste pedido e ainda nao decidido. */
    private ProdutoPreco precoPendente(Long id, String valor, LocalDate inicio, Long solicitanteId) {
        var modalidade = new ProdutoModalidade();
        modalidade.setId(MODALIDADE);

        var solicitante = new DadosPessoais();
        solicitante.setId(solicitanteId);

        var preco = new ProdutoPreco();
        preco.setId(id);
        preco.setModalidade(modalidade);
        preco.setValor(new BigDecimal(valor));
        preco.setVigenciaInicio(inicio);
        preco.setStatus(StatusProdutoPreco.PENDENTE_APROVACAO);
        preco.setSolicitadoPor(solicitante);
        return preco;
    }

    private Serie serie(long id) {
        var s = new Serie();
        s.setId(id);
        s.setNome("6º ano");
        return s;
    }

    private CadastroProdutoPrecoDto pedido(String valor, LocalDate inicio, Long serieId, Boolean encerrar) {
        return new CadastroProdutoPrecoDto(null, null, serieId, null, new BigDecimal(valor),
                inicio, null, encerrar);
    }

    private void modalidadeExiste() {
        var modalidade = new ProdutoModalidade();
        modalidade.setId(MODALIDADE);
        when(modalidadeRepository.findById(MODALIDADE)).thenReturn(Optional.of(modalidade));
    }

    private void jaExistem(ProdutoPreco... precos) {
        when(precoRepository.buscarDaModalidade(MODALIDADE)).thenReturn(List.of(precos));
    }

    /** Alguem logado, para o pedido de reajuste ter autor. */
    private DadosPessoais logado() {
        var pessoa = new DadosPessoais();
        pessoa.setId(USUARIO);
        pessoa.setNome("Operadora do catálogo");
        when(auditor.getCurrentAuditor()).thenReturn(Optional.of(USUARIO));
        when(entityManager.getReference(DadosPessoais.class, USUARIO)).thenReturn(pessoa);
        return pessoa;
    }

    /** Outra pessoa logada -- quem aprova nao pode ser quem pediu. */
    private DadosPessoais logadoComo(Long id) {
        var pessoa = new DadosPessoais();
        pessoa.setId(id);
        when(auditor.getCurrentAuditor()).thenReturn(Optional.of(id));
        when(entityManager.getReference(DadosPessoais.class, id)).thenReturn(pessoa);
        return pessoa;
    }

    @Nested
    @DisplayName("sobreposição")
    class Sobreposicao {

        @Test
        @DisplayName("preço novo no mesmo escopo é recusado, e a mensagem diz o que fazer")
        void mesmoEscopoRecusado() {
            modalidadeExiste();
            jaExistem(precoExistente("1200.00", LocalDate.now().minusMonths(6), null, null));

            assertThatThrownBy(() -> service.cadastrar(MODALIDADE,
                    pedido("1350.00", LocalDate.now().plusDays(10), null, null)))
                    .isInstanceOf(ErrosSistema.OperacaoInvalidaException.class)
                    .hasMessageContaining("mesmo escopo")
                    .hasMessageContaining("encerrar o anterior");

            verify(precoRepository, never()).save(any());
        }

        /**
         * O caso que faz a tabela de precos existir: um preco geral e uma excecao
         * por serie convivendo. Se a regra barrasse isto, a escola teria de
         * cadastrar uma linha por serie.
         */
        @Test
        @DisplayName("escopos diferentes convivem: geral e exceção por série")
        void escoposDiferentesConvivem() {
            modalidadeExiste();
            jaExistem(precoExistente("1200.00", LocalDate.now().minusMonths(6), null, null));
            when(serieRepository.findById(7L)).thenReturn(Optional.of(serie(7L)));
            logado();

            assertThatCode(() -> service.cadastrar(MODALIDADE,
                    pedido("1350.00", LocalDate.now().plusDays(10), 7L, null)))
                    .doesNotThrowAnyException();

            verify(precoRepository).save(any());
        }

        /** Vigências que não se tocam no mesmo escopo também convivem. */
        @Test
        @DisplayName("mesmo escopo, vigências que não se cruzam, convivem")
        void vigenciasSeparadas() {
            modalidadeExiste();
            jaExistem(precoExistente("1200.00",
                    LocalDate.now().minusMonths(12), LocalDate.now().minusMonths(6), null));
            logado();

            assertThatCode(() -> service.cadastrar(MODALIDADE,
                    pedido("1350.00", LocalDate.now().minusMonths(3), null, null)))
                    .doesNotThrowAnyException();
        }
    }

    @Nested
    @DisplayName("reajuste")
    class Reajuste {

        /**
         * A disciplina da V100: reajuste nao edita o valor no lugar, fecha a
         * vigencia da linha atual e insere outra. Sem isto na API, a tela faria
         * duas chamadas e, se a segunda falhasse, a escola ficaria sem preco.
         *
         * O que mudou com a aprovacao: o PEDIDO nao encerra mais nada. Se
         * encerrasse, o preco antigo morreria na hora do pedido e, ate alguem
         * decidir, o produto ficaria sem preco nenhum -- e sem preco a matricula
         * para. Quem encerra e a aprovacao, no instante em que o novo passa a
         * valer.
         */
        @Test
        @DisplayName("o pedido NÃO encerra o anterior: até a decisão, o preço antigo é o preço")
        void pedidoNaoEncerraAnterior() {
            var inicioDoNovo = LocalDate.now().plusDays(10);
            var anterior = precoExistente("1200.00", LocalDate.now().minusMonths(6), null, null);

            modalidadeExiste();
            jaExistem(anterior);
            logado();

            service.cadastrar(MODALIDADE, pedido("1350.00", inicioDoNovo, null, true));

            assertThat(anterior.getVigenciaFim())
                    .as("encerrar no pedido deixaria o produto sem preço até alguém aprovar")
                    .isNull();
        }

        @Test
        @DisplayName("aprovar encerra o anterior na véspera, sem buraco e sem sobreposição")
        void aprovacaoEncerraAnterior() {
            var inicioDoNovo = LocalDate.now().plusDays(10);
            var anterior = precoExistente("1200.00", LocalDate.now().minusMonths(6), null, null);
            var pedido = precoPendente(2L, "1350.00", inicioDoNovo, USUARIO);

            when(precoRepository.findById(2L)).thenReturn(Optional.of(pedido));
            jaExistem(anterior, pedido);
            logadoComo(50L);

            service.aprovar(2L, new DecisaoPrecoRequest("reajuste INPC"));

            assertThat(anterior.getVigenciaFim())
                    .as("o anterior tem de terminar na véspera: um dia a mais seria sobreposição,"
                            + " um a menos seria um dia sem preço")
                    .isEqualTo(inicioDoNovo.minusDays(1));
            assertThat(pedido.getStatus()).isEqualTo(StatusProdutoPreco.APROVADO);
        }

        /**
         * Encerrar so faz sentido se o anterior COMECOU antes. Fechar no dia
         * anterior ao novo daria uma vigencia que termina antes de comecar, e o
         * CHECK do banco recusaria com um erro que nao explica nada a quem clicou.
         */
        @Test
        @DisplayName("não encerra um preço que começa depois do novo")
        void anteriorComecaDepois() {
            modalidadeExiste();
            jaExistem(precoExistente("1200.00", LocalDate.now().plusMonths(2), null, null));

            assertThatThrownBy(() -> service.cadastrar(MODALIDADE,
                    pedido("1350.00", LocalDate.now().plusDays(10), null, true)))
                    .isInstanceOf(ErrosSistema.OperacaoInvalidaException.class)
                    .hasMessageContaining("posterior");
        }
    }

    /**
     * O controle que faltava na V1: reajuste e decisao, nao cadastro. Quem muda o
     * preco muda a receita do ano inteiro.
     */
    @Nested
    @DisplayName("aprovação")
    class Aprovacao {

        @Test
        @DisplayName("o pedido nasce pendente e guarda quem pediu")
        void nascePendente() {
            modalidadeExiste();
            jaExistem();
            logado();

            var criado = service.cadastrar(MODALIDADE,
                    pedido("1350.00", LocalDate.now().plusDays(10), null, null));

            assertThat(criado.status()).isEqualTo(StatusProdutoPreco.PENDENTE_APROVACAO);
            assertThat(criado.solicitadoPor())
                    .as("sem registrar quem pediu, não há como barrar a autoaprovação depois")
                    .isEqualTo("Operadora do catálogo");
        }

        /**
         * Sem esta regra, quem tem acesso a aprovacao tem poder ilimitado sobre o
         * preco: bastaria pedir e aprovar, e o controle inteiro seria teatro.
         */
        @Test
        @DisplayName("quem pediu o reajuste não aprova o próprio pedido")
        void naoAprovaOProprioPedido() {
            var pendente = precoPendente(2L, "1350.00", LocalDate.now().plusDays(10), USUARIO);
            when(precoRepository.findById(2L)).thenReturn(Optional.of(pendente));
            logado();

            assertThatThrownBy(() -> service.aprovar(2L, new DecisaoPrecoRequest("eu mesmo")))
                    .isInstanceOf(ErrosSistema.AcessoNegadoException.class)
                    .hasMessageContaining("próprio pedido");

            assertThat(pendente.getStatus()).isEqualTo(StatusProdutoPreco.PENDENTE_APROVACAO);
        }

        @Test
        @DisplayName("recusa sem motivo é recusada: o motivo é a explicação do preço do ano")
        void rejeitarExigeMotivo() {
            var pendente = precoPendente(2L, "1350.00", LocalDate.now().plusDays(10), USUARIO);
            when(precoRepository.findById(2L)).thenReturn(Optional.of(pendente));
            logadoComo(50L);

            assertThatThrownBy(() -> service.rejeitar(2L, new DecisaoPrecoRequest("   ")))
                    .isInstanceOf(ErrosSistema.OperacaoInvalidaException.class)
                    .hasMessageContaining("motivo da recusa");

            verify(precoRepository, never()).save(any());
        }

        @Test
        @DisplayName("preço já aprovado não é aprovado de novo: reajuste é linha nova")
        void naoAprovaDuasVezes() {
            var aprovado = precoExistente("1200.00", LocalDate.now().minusDays(1), null, null);
            when(precoRepository.findById(1L)).thenReturn(Optional.of(aprovado));
            logadoComo(50L);

            assertThatThrownBy(() -> service.aprovar(1L, null))
                    .isInstanceOf(ErrosSistema.OperacaoInvalidaException.class)
                    .hasMessageContaining("não se edita no lugar");
        }

        /**
         * Dois pendentes no mesmo escopo nao podem ser aprovados em sequencia: o
         * segundo deixaria dois precos valendo, e a cobranca viraria sorteio.
         */
        @Test
        @DisplayName("não aprova com outro pedido pendente no mesmo escopo")
        void naoAprovaComOutroPendente() {
            var inicio = LocalDate.now().plusDays(10);
            var umPedido = precoPendente(2L, "1350.00", inicio, USUARIO);
            var outroPedido = precoPendente(3L, "1500.00", inicio, USUARIO);

            when(precoRepository.findById(2L)).thenReturn(Optional.of(umPedido));
            jaExistem(umPedido, outroPedido);
            logadoComo(50L);

            assertThatThrownBy(() -> service.aprovar(2L, null))
                    .isInstanceOf(ErrosSistema.OperacaoInvalidaException.class)
                    .hasMessageContaining("Decida um dos dois");
        }
    }

    @Nested
    @DisplayName("vigência e exclusão")
    class VigenciaEExclusao {

        @Test
        @DisplayName("vigência que termina antes de começar é recusada")
        void vigenciaInvertida() {
            modalidadeExiste();

            var pedido = new CadastroProdutoPrecoDto(null, null, null, null, new BigDecimal("1200.00"),
                    LocalDate.now().plusDays(30), LocalDate.now().plusDays(10), null);

            assertThatThrownBy(() -> service.cadastrar(MODALIDADE, pedido))
                    .isInstanceOf(ErrosSistema.OperacaoInvalidaException.class)
                    .hasMessageContaining("antes de começar");
        }

        @Test
        @DisplayName("preço que já entrou em vigor não se exclui: encerra-se")
        void naoExcluiPrecoVigente() {
            when(precoRepository.findById(1L))
                    .thenReturn(Optional.of(precoExistente("1200.00", LocalDate.now().minusDays(1), null, null)));

            assertThatThrownBy(() -> service.excluir(1L))
                    .isInstanceOf(ErrosSistema.OperacaoInvalidaException.class)
                    .hasMessageContaining("Encerre a vigência");

            verify(precoRepository, never()).delete(any());
        }

        /**
         * Pendente nunca precificou nada -- e um pedido, nao um preco. Apagar e o
         * jeito honesto de desistir de um reajuste antes de incomodar quem
         * aprova, mesmo que a vigencia pedida ja tenha comecado.
         */
        @Test
        @DisplayName("pedido pendente pode ser excluído mesmo com a vigência já começada")
        void excluiPendenteComVigenciaComecada() {
            var pendente = precoPendente(2L, "1350.00", LocalDate.now().minusDays(5), USUARIO);
            when(precoRepository.findById(2L)).thenReturn(Optional.of(pendente));

            service.excluir(2L);

            verify(precoRepository).delete(pendente);
        }

        /** Erro de digitação antes de valer: esse pode sumir. */
        @Test
        @DisplayName("preço que ainda não entrou em vigor pode ser excluído")
        void excluiPrecoFuturo() {
            when(precoRepository.findById(1L))
                    .thenReturn(Optional.of(precoExistente("1200.00", LocalDate.now().plusDays(5), null, null)));

            service.excluir(1L);

            verify(precoRepository).delete(any());
        }

        @Test
        @DisplayName("encerramento anterior ao início é recusado")
        void encerramentoInvalido() {
            when(precoRepository.findById(1L))
                    .thenReturn(Optional.of(precoExistente("1200.00", LocalDate.now().minusDays(10), null, null)));

            assertThatThrownBy(() -> service.encerrar(1L, LocalDate.now().minusDays(30)))
                    .isInstanceOf(ErrosSistema.OperacaoInvalidaException.class)
                    .hasMessageContaining("anterior ao início");
        }
    }
}
