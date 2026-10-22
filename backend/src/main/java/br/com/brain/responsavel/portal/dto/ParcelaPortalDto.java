package br.com.brain.responsavel.portal.dto;

import br.com.brain.enums.FormaPagamento;
import br.com.brain.enums.SituacaoParcela;
import br.com.brain.enums.StatusTitulo;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Uma linha do carne como a familia ve.
 *
 * Bruto, desconto e liquido vem os tres, e e o ponto todo: a familia ve
 * "mensalidade 1.350, bolsa -270, a pagar 1.080". So o liquido esconderia a
 * bolsa de quem a recebeu -- e bolsa que ninguem percebe nao gera a gratidao que
 * a escola esperava quando decidiu concede-la.
 */
public record ParcelaPortalDto(
        Long id,
        Long alunoId,
        String alunoNome,
        String contratoNumero,
        Integer numeroParcela,
        Integer totalParcelas,
        LocalDate competencia,
        LocalDate vencimento,
        String descricao,
        BigDecimal valorBruto,
        /** O quanto a bolsa abateu nesta parcela. Zero quando nao ha bolsa. */
        BigDecimal valorDesconto,
        BigDecimal valorLiquido,
        StatusTitulo status,
        SituacaoParcela situacao,
        /** Zero ou negativo quando ainda nao venceu. */
        long diasDeAtraso,
        LocalDate pagaEm,
        FormaPagamento formaPagamento) {
}
