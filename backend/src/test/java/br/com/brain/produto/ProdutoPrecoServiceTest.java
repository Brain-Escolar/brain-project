package br.com.brain.produto;

import br.com.brain.exception.ErrosSistema;
import br.com.brain.produto.dto.CadastroProdutoPrecoDto;
import br.com.brain.serie.Serie;
import br.com.brain.serie.SerieRepository;
import br.com.brain.unidade.UnidadeRepository;
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

    @InjectMocks
    private ProdutoPrecoService service;

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
         */
        @Test
        @DisplayName("encerra o anterior no dia anterior ao novo, sem buraco e sem sobreposição")
        void encerraAnterior() {
            var inicioDoNovo = LocalDate.now().plusDays(10);
            var anterior = precoExistente("1200.00", LocalDate.now().minusMonths(6), null, null);

            modalidadeExiste();
            jaExistem(anterior);

            service.cadastrar(MODALIDADE, pedido("1350.00", inicioDoNovo, null, true));

            assertThat(anterior.getVigenciaFim())
                    .as("o anterior tem de terminar na véspera: um dia a mais seria sobreposição,"
                            + " um a menos seria um dia sem preço")
                    .isEqualTo(inicioDoNovo.minusDays(1));
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
