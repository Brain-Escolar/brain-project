package br.com.brain.bolsa.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/**
 * A decisao sobre um pedido de bolsa que ficou acima da alcada de quem pediu.
 *
 * `percentualAprovado` em branco significa "aprovo o que foi pedido". Informado,
 * pode ser MENOR -- "pediu 30, saiu 25" e o caso comum da negociacao, e os dois
 * numeros ficam guardados lado a lado.
 */
public record AprovacaoBolsaRequest(

        @DecimalMin(value = "0.01", message = "Aprovar com 0% não é aprovar: rejeite o pedido.")
        @DecimalMax(value = "100.00", message = "O percentual não pode passar de 100%.")
        BigDecimal percentualAprovado,

        @Size(max = 255, message = "A observação não pode passar de 255 caracteres.")
        String observacao,

        /** Validade da reserva de orçamento. Omitido, usa o padrão do sistema. */
        Integer diasValidade) {
}
