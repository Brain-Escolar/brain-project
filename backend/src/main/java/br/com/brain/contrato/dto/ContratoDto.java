package br.com.brain.contrato.dto;

import br.com.brain.contrato.ContratoServico;
import br.com.brain.contrato.Titulo;
import br.com.brain.enums.StatusContratoServico;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * O contrato como a secretaria e o responsavel precisam ver: os valores, os itens
 * que os compoem e o carne.
 */
public record ContratoDto(
        Long id,
        String numero,
        Long matriculaId,
        Long responsavelId,
        Integer qtdParcelas,
        Integer diaVencimento,
        BigDecimal valorBruto,
        BigDecimal valorDesconto,
        BigDecimal valorLiquido,
        StatusContratoServico status,
        LocalDate dataInicio,
        LocalDate dataFim,
        List<ContratoItemDto> itens,
        List<TituloDto> titulos,
        /**
         * Soma dos titulos. Existe para a tela poder provar que o carne fecha com
         * o contrato: se divergir de valorLiquido, a familia foi cobrada a mais ou
         * a menos do que assinou, e e melhor descobrir na tela do que na ligacao.
         */
        BigDecimal somaDosTitulos,
        Boolean carneFecha) {

    public ContratoDto(ContratoServico c, List<Titulo> titulos) {
        this(
                c.getId(),
                c.getNumero(),
                c.getMatricula().getId(),
                c.getResponsavel().getId(),
                c.getQtdParcelas(),
                c.getDiaVencimento(),
                c.getValorBruto(),
                c.getValorDesconto(),
                c.getValorLiquido(),
                c.getStatus(),
                c.getDataInicio(),
                c.getDataFim(),
                c.getItens().stream().map(ContratoItemDto::new).toList(),
                titulos.stream().map(TituloDto::new).toList(),
                somar(titulos),
                somar(titulos).compareTo(c.getValorLiquido()) == 0);
    }

    private static BigDecimal somar(List<Titulo> titulos) {
        return titulos.stream()
                .map(Titulo::getValorLiquido)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
