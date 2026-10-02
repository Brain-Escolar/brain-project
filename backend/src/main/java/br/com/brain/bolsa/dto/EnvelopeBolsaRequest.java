package br.com.brain.bolsa.dto;

import br.com.brain.enums.BaseCalculoEnvelope;
import br.com.brain.enums.NaturezaEnvelope;
import br.com.brain.enums.UnidadeMedidaEnvelope;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

/**
 * Um envelope de orcamento de bolsa.
 *
 * As quatro unidades de medida existem porque escola nenhuma e obrigada a
 * pensar do mesmo jeito: uma define teto em reais, outra em percentual da
 * receita, outra em numero de bolsas integrais, e algumas simplesmente nao tem
 * teto adicional. SEM_LIMITE e cenario valido, nao configuracao faltando.
 *
 * Qual campo de limite preencher depende da unidade de medida, e e o servico que
 * explica isso -- o banco tem CHECK para cada combinacao, mas violacao de CHECK
 * chega ao usuario como erro 500 ilegivel.
 */
public record EnvelopeBolsaRequest(

        @NotNull(message = "A política é obrigatória.")
        Long politicaId,

        @NotBlank(message = "O envelope precisa de um nome: é por ele que a tela explica qual teto segurou a bolsa.")
        String nome,

        /**
         * LIMITE_MAXIMO e teto comercial; META_MINIMA e piso filantropico
         * (CEBAS). Mesmas colunas, muda so o sentido da comparacao.
         */
        @NotNull(message = "A natureza é obrigatória (teto máximo ou piso mínimo).")
        NaturezaEnvelope natureza,

        @NotNull(message = "A unidade de medida é obrigatória.")
        UnidadeMedidaEnvelope unidadeMedida,

        /** Obrigatorio em VALOR_ABSOLUTO. */
        @DecimalMin(value = "0.00", message = "O limite não pode ser negativo.")
        BigDecimal valorLimite,

        /** Obrigatorio em PERCENTUAL_RECEITA. */
        @DecimalMin(value = "0.00", message = "O percentual não pode ser negativo.")
        @DecimalMax(value = "100.00", message = "O percentual não pode passar de 100%.")
        BigDecimal percentualLimite,

        /** Obrigatorio em QUANTIDADE_EQUIVALENTE. Em bolsas integrais: 10.5 = dez e meia. */
        @DecimalMin(value = "0.00", message = "A quantidade não pode ser negativa.")
        BigDecimal quantidadeLimite,

        /**
         * Obrigatorio em PERCENTUAL_RECEITA. RECEITA_REALIZADA cresce a cada
         * matricula a preco cheio; RECEITA_PROJETADA existe porque a realizada
         * vale quase zero no inicio da campanha, e ai ninguem conseguiria
         * conceder bolsa nenhuma.
         */
        BaseCalculoEnvelope baseCalculo,

        /** Obrigatorio quando a base e RECEITA_PROJETADA. */
        @DecimalMin(value = "0.00", message = "A receita projetada não pode ser negativa.")
        BigDecimal receitaProjetada,

        /** Escopo. Todos nulos = envelope global do ano letivo. */
        Long unidadeId,
        Long serieId,
        Long tipoBolsaId,

        /** Se concessao pode passar do teto com aprovacao de quem tem alçada. */
        Boolean permiteExcedente) {
}
