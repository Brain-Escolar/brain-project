package br.com.brain.contrato.dto;

import br.com.brain.contrato.ContratoItem;

import java.math.BigDecimal;

public record ContratoItemDto(
        Long id,
        String descricao,
        BigDecimal valorUnitario,
        Integer quantidade,
        BigDecimal total,
        /** Se a bolsa incidiu sobre esta linha. Material normalmente não. */
        Boolean elegivelBolsa) {

    public ContratoItemDto(ContratoItem i) {
        this(i.getId(), i.getDescricao(), i.getValorUnitario(), i.getQuantidade(),
                i.total(), i.getElegivelBolsa());
    }
}
