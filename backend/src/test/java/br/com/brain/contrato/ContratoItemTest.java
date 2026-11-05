package br.com.brain.contrato;

import br.com.brain.enums.NaturezaProduto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * A regra que decide quantas faturas cada linha do contrato gera.
 *
 * Parece pequena e nao e: errar aqui emite a mensalidade do ano inteiro como um
 * titulo so, ou parcela a taxa de matricula em doze. Os dois erros so aparecem
 * quando a familia recebe o boleto.
 */
@DisplayName("ContratoItem")
class ContratoItemTest {

    private ContratoItem item(NaturezaProduto natureza, String valorUnitario, int quantidade) {
        var item = new ContratoItem();
        item.setNatureza(natureza);
        item.setValorUnitario(new BigDecimal(valorUnitario));
        item.setQuantidade(quantidade);
        return item;
    }

    @Test
    @DisplayName("mensalidade recorrente vira carnê")
    void recorrenteViraCarne() {
        assertThat(item(NaturezaProduto.RECORRENTE, "1350.00", 1).quantidadeDeTitulos(12))
                .isEqualTo(12);
        assertThat(item(NaturezaProduto.RECORRENTE, "1350.00", 1).quantidadeDeTitulos(7))
                .as("contrato de 7 parcelas gera 7, não 12")
                .isEqualTo(7);
    }

    /**
     * Taxa de matricula e material sao cobranca unica. Diluir nas doze parcelas
     * era o que o sistema fazia antes, e fazia a familia pagar material em
     * dezembro -- muito depois de ter recebido o material.
     */
    @Test
    @DisplayName("cobrança única e eventual geram um título só, qualquer que seja o contrato")
    void unicaEEventualGeramUm() {
        assertThat(item(NaturezaProduto.UNICO, "2698.76", 1).quantidadeDeTitulos(12)).isEqualTo(1);
        assertThat(item(NaturezaProduto.EVENTUAL, "180.00", 1).quantidadeDeTitulos(12)).isEqualTo(1);
    }

    /**
     * Natureza nula cai no caminho de cobranca unica -- e por isso
     * MatriculaEfetivacaoService RECUSA efetivar antes de chegar aqui. Este teste
     * existe para documentar que o default sozinho nao protege ninguem: quem
     * protege e a guarda la.
     */
    @Test
    @DisplayName("sem natureza o default é um título — e é por isso que a efetivação recusa antes")
    void semNaturezaCaiNoUnico() {
        assertThat(item(null, "1350.00", 1).quantidadeDeTitulos(12)).isEqualTo(1);
    }

    @Test
    @DisplayName("o total multiplica pela quantidade")
    void total() {
        assertThat(item(NaturezaProduto.UNICO, "435.76", 2).total()).isEqualByComparingTo("871.52");
    }

    @Test
    @DisplayName("o líquido desconta a bolsa que pousou neste item")
    void totalLiquido() {
        var mensalidade = item(NaturezaProduto.RECORRENTE, "16200.00", 1);
        mensalidade.setValorDesconto(new BigDecimal("3240.00"));

        assertThat(mensalidade.totalLiquido()).isEqualByComparingTo("12960.00");
    }

    /** Item sem bolsa nenhuma: o líquido é o total, sem NullPointerException. */
    @Test
    @DisplayName("item sem desconto tem líquido igual ao total")
    void semDesconto() {
        var seguro = item(NaturezaProduto.RECORRENTE, "142.80", 1);
        seguro.setValorDesconto(null);

        assertThat(seguro.totalLiquido()).isEqualByComparingTo("142.80");
    }
}
