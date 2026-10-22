package br.com.brain.financeiro.dto;

import br.com.brain.enums.FaixaAging;

import java.math.BigDecimal;

/**
 * Uma faixa do aging. Vem sempre completa -- as cinco faixas, mesmo as zeradas
 * -- para a tabela da tela nao mudar de forma conforme o mes.
 */
public record FaixaResumoDto(
        FaixaAging faixa,
        String rotulo,
        int quantidadeDeParcelas,
        BigDecimal valor,
        /** Fatia desta faixa dentro da carteira aberta, em %. */
        BigDecimal percentualDaCarteira) {
}
