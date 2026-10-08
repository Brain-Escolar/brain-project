package br.com.brain.contrato.dto;

import br.com.brain.contrato.Titulo;
import br.com.brain.enums.StatusTitulo;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TituloDto(
        Long id,
        Long responsavelId,
        Integer numeroParcela,
        LocalDate competencia,
        LocalDate vencimento,
        String descricao,
        BigDecimal valorBruto,
        /** Separado do bruto para a bolsa aparecer no boleto, e não só o líquido. */
        BigDecimal valorDesconto,
        BigDecimal valorLiquido,
        StatusTitulo status,
        Boolean vencido) {

    public TituloDto(Titulo t) {
        this(
                t.getId(),
                t.getResponsavel().getId(),
                t.getNumeroParcela(),
                t.getCompetencia(),
                t.getVencimento(),
                t.getDescricao(),
                t.getValorBruto(),
                t.getValorDesconto(),
                t.getValorLiquido(),
                t.getStatus(),
                t.estaAberto() && t.getVencimento().isBefore(LocalDate.now()));
    }
}
