package br.com.brain.simulacao.dto;

import br.com.brain.enums.StatusSimulacaoFinanceira;
import br.com.brain.enums.Turno;
import br.com.brain.simulacao.SimulacaoFinanceira;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;

/**
 * O que o responsavel ve: quanto e, em quantas vezes, e quanto ja saiu de
 * desconto. Os itens vao junto porque "por que estou pagando isso" e a
 * pergunta seguinte, sempre.
 */
public record SimulacaoDto(
        Long id,
        Integer anoLetivo,
        Turno turno,
        Integer qtdParcelas,
        Integer diaVencimento,
        BigDecimal valorBruto,
        BigDecimal valorDesconto,
        BigDecimal valorLiquido,
        /**
         * Media simples: liquido dividido pelas parcelas, ja com a bolsa.
         *
         * E media mesmo, nao o valor do boleto. Produto de cobranca unica
         * (matricula, taxa de material) entra inteiro no bruto e aqui aparece
         * diluido no ano. O carne de verdade, com o primeiro boleto diferente
         * dos outros, vem com os titulos -- e ai o numero passa a ser exato.
         */
        BigDecimal valorParcelaMedia,
        StatusSimulacaoFinanceira status,
        Instant reservaExpiraEm,
        Long contratoId,
        List<ItemDto> itens) {

    public record ItemDto(
            Long id,
            String descricao,
            BigDecimal valorUnitario,
            Integer quantidade,
            BigDecimal total,
            Boolean elegivelBolsa) {
    }

    public SimulacaoDto(SimulacaoFinanceira s) {
        this(
                s.getId(),
                s.getAnoLetivo(),
                s.getTurno(),
                s.getQtdParcelas(),
                s.getDiaVencimento(),
                s.getValorBruto(),
                s.getValorDesconto(),
                s.getValorLiquido(),
                s.getValorLiquido().divide(
                        BigDecimal.valueOf(s.getQtdParcelas()), 2, RoundingMode.HALF_UP),
                s.getStatus(),
                s.getReservaExpiraEm(),
                s.getContratoId(),
                s.getItens().stream()
                        .map(i -> new ItemDto(
                                i.getId(),
                                i.getDescricao(),
                                i.getValorUnitario(),
                                i.getQuantidade(),
                                i.total(),
                                i.getElegivelBolsa()))
                        .toList());
    }
}
